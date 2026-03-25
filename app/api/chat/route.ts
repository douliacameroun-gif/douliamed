import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const genAI = new GoogleGenAI({ 
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY || "" 
});

// Check API key on initialization
if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY && !process.env.GEMINI_API_KEY && !process.env.API_KEY) {
  console.warn("WARNING: No Gemini API key found in environment variables (NEXT_PUBLIC_GEMINI_API_KEY, GEMINI_API_KEY, or API_KEY).");
}

const SYSTEM_PROMPT = `IDENTITÉ ET MISSION
Tu es DouliaMed, l'intelligence médicale exclusive et le partenaire d'excellence académique du Docteur Charlotte Eposse, pédiatre et enseignante-chercheuse à Douala. 
Ton rôle est d'être son assistant de recherche de haut niveau, son rédacteur scientifique et son organisateur de pensée durant sa préparation intensive au concours d'agrégation. 
Ton ton est académique, rigoureux, profondément respectueux, et constant dans l'encouragement.

RÈGLES DE FORMATAGE STRICTES (POUR LA SYNTHÈSE VOCALE)
Ces règles sont absolues pour garantir une lecture fluide par le moteur Text-To-Speech (TTS) :
1. INTERDICTION TOTALE d'utiliser des astérisques, des dièses, des tirets ou des balises HTML. 
2. N'utilise aucune liste à puces classique. Structure tes idées dans des paragraphes fluides qui s'écoutent comme un discours oral.
3. Sépare obligatoirement chaque paragraphe ou grande idée par deux sauts de ligne complets pour imposer une pause naturelle à l'oral.
4. Rédige des phrases directes, élégantes et structurées. 
5. Les titres de sections ou les mots-clés essentiels peuvent être mis en majuscules pour les souligner subtilement.

MÉTHODOLOGIE DE RÉPONSE ET D'ANALYSE
- RECHERCHE HYBRIDE : Lorsque le Docteur pose une question, base-toi d'abord sur le contexte fourni par sa base documentaire (Supabase). Si l'information est incomplète ou nécessite des données récentes (protocoles OMS, publications récentes), tu dois faire appel à l'outil de recherche web (Tavily) pour obtenir des données en temps réel avant de formuler ta réponse.
- RÉDACTION ET BIostatistique : Aide-la à structurer ses leçons et Titres et Travaux. Transforme ses pensées brutes en prose médicale de haut niveau. Vérifie systématiquement la cohérence biostatistique (ANOVA, régressions, Intervalles de Confiance à 95 %).
- COACHING : Gère son chronogramme. Rappelle-lui ses objectifs, assure la continuité de sa pensée entre les sessions, et porte-la vers l'excellence.

Règle finale : Tes réponses doivent toujours se suffire à elles-mêmes à l'oral. Si tu cites une source, intègre-la naturellement dans la phrase.`;

async function searchWeb(query: string) {
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: query,
        search_depth: "advanced",
        include_answer: true,
        max_results: 5,
      }),
    });
    const data = await response.json();
    return data.results.map((r: any) => `Source: ${r.title} (${r.url})\nContenu: ${r.content}`).join("\n\n");
  } catch (error) {
    console.error("Tavily search error:", error);
    return "Aucun résultat de recherche web disponible.";
  }
}

async function getSupabaseContext(query: string) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      console.warn("Supabase URL is not configured or is a placeholder.");
      return "Le contexte local n'est pas disponible car Supabase n'est pas configuré.";
    }

    // Try to search by title first since 'summary' might be missing
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .ilike('title', `%${query}%`)
      .limit(3);

    if (error) {
      console.error("Supabase search error:", JSON.stringify(error));
      // Fallback to just getting the latest documents
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('documents')
        .select('*')
        .limit(3);
      
      if (fallbackError) {
        console.error("Supabase fallback search error:", JSON.stringify(fallbackError));
        return "Aucun document pertinent trouvé dans la base locale.";
      }
      
      return fallbackData?.map(doc => {
        const content = doc.summary || doc.content || doc.abstract || "Contenu non disponible.";
        return `Document: ${doc.title}\nContenu: ${content}`;
      }).join("\n\n") || "Aucun document pertinent trouvé dans la base locale.";
    }

    if (!data || data.length === 0) return "Aucun document pertinent trouvé dans la base locale.";

    return data.map(doc => {
      const content = doc.summary || doc.content || doc.abstract || "Contenu non disponible.";
      return `Document: ${doc.title}\nContenu: ${content}`;
    }).join("\n\n");
  } catch (error) {
    console.error("Supabase context error:", error);
    return "Erreur lors de la récupération du contexte local.";
  }
}

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // 1. Hybrid Search
    const [supabaseContext, searchResults] = await Promise.all([
      getSupabaseContext(message),
      searchWeb(message)
    ]);

    const prompt = `
CONTEXTE LOCAL (SUPABASE) :
${supabaseContext}

CONTEXTE WEB (TAVILY) :
${searchResults}

QUESTION DU DOCTEUR EPOSSE :
${message}

RÉPONSE DE DOULIAMED (SANS SYMBOLES DE FORMATAGE) :
`;

    // 2. Prepare Gemini prompt
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 2048,
      },
    });

    const responseText = response.text || "Désolé, je n'ai pas pu générer de réponse.";

    // 3. Save to Supabase
    try {
      // Check if Supabase is configured before trying to save
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
        const { error: dbError } = await supabase.from('messages').insert([
          { role: 'user', content: message, created_at: new Date().toISOString() },
          { role: 'assistant', content: responseText, created_at: new Date().toISOString() }
        ]);
        if (dbError) {
          console.error("Supabase save error:", JSON.stringify(dbError));
        }
      }
    } catch (dbError) {
      console.error("Supabase save error (exception):", dbError);
    }

    return NextResponse.json({ text: responseText });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Une erreur est survenue lors de la génération de la réponse." }, { status: 500 });
  }
}
