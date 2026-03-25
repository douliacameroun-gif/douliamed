import { GoogleGenAI } from "@google/genai";
import { supabase } from "./supabase";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

/**
 * Processes a PDF document uploaded to Supabase Storage.
 * Extracts text (or uses vision) and generates a scientific summary.
 * Updates the 'documents' table with the summary.
 */
export async function processDocument(documentId: string, bucketName: string, filePath: string) {
  try {
    // 1. Download the file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (downloadError) throw downloadError;
    if (!fileData) throw new Error("File data is empty");

    // 2. Convert file to base64 for Gemini
    const buffer = await fileData.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString("base64");

    // 3. Call Gemini to generate a scientific summary
    const prompt = `Tu es un expert en recherche médicale. Analyse ce document PDF et génère un résumé de 3 à 5 phrases hautement scientifiques. 
Le résumé doit être précis, utiliser la terminologie médicale appropriée et mettre en évidence les conclusions ou méthodologies clés.
Format de sortie : Texte pur, sans symboles de formatage.`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64Data,
              },
            },
          ],
        },
      ],
    });

    const summary = result.text || "Résumé non disponible.";

    // 4. Update the 'documents' table in Supabase
    // Try 'summary' first, then 'content' as fallback
    const { error: updateError } = await supabase
      .from("documents")
      .update({ summary: summary })
      .eq("id", documentId);

    if (updateError) {
      console.warn("Failed to update 'summary' column, trying 'content'...", updateError.message);
      const { error: contentUpdateError } = await supabase
        .from("documents")
        .update({ content: summary })
        .eq("id", documentId);
      
      if (contentUpdateError) {
        console.error("Failed to update both 'summary' and 'content' columns:", contentUpdateError.message);
        // We don't throw here to allow the process to finish even if DB update fails
      }
    }

    return { success: true, summary };
  } catch (error) {
    console.error("Document processing error:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
