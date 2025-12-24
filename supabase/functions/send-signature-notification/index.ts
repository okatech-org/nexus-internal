import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignatureNotificationRequest {
  signerName: string;
  signerEmail: string;
  signerRole: string;
  signerOrder: number;
  totalSigners: number;
  documentNames: string[];
  caseReference: string;
  caseTitle: string;
  requestedBy: string;
  expiresAt: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: SignatureNotificationRequest = await req.json();
    
    console.log("Sending signature notification to:", payload.signerEmail);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const {
      signerName,
      signerEmail,
      signerRole,
      signerOrder,
      totalSigners,
      documentNames,
      caseReference,
      caseTitle,
      requestedBy,
      expiresAt,
    } = payload;

    const formattedExpiry = new Date(expiresAt).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const documentList = documentNames.map(name => `<li>${name}</li>`).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                      📝 Signature requise
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 32px;">
                    <p style="margin: 0 0 16px; color: #374151; font-size: 16px;">
                      Bonjour <strong>${signerName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 24px; color: #374151; font-size: 16px;">
                      Vous êtes invité(e) à signer un document dans le cadre du dossier suivant :
                    </p>
                    
                    <!-- Case Info Box -->
                    <table role="presentation" style="width: 100%; background-color: #f8fafc; border-radius: 8px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0 0 8px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                            Référence
                          </p>
                          <p style="margin: 0 0 16px; color: #1e293b; font-size: 14px; font-family: monospace; font-weight: 600;">
                            ${caseReference}
                          </p>
                          
                          <p style="margin: 0 0 8px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                            Titre
                          </p>
                          <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 600;">
                            ${caseTitle}
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Documents -->
                    <p style="margin: 0 0 12px; color: #374151; font-size: 14px; font-weight: 600;">
                      Document(s) à signer :
                    </p>
                    <ul style="margin: 0 0 24px; padding-left: 20px; color: #374151; font-size: 14px;">
                      ${documentList}
                    </ul>
                    
                    <!-- Order Badge -->
                    <table role="presentation" style="width: 100%; background-color: #fef3c7; border-radius: 8px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 16px;">
                          <p style="margin: 0; color: #92400e; font-size: 14px;">
                            ⚡ <strong>Ordre de signature :</strong> Vous êtes le signataire n°${signerOrder} sur ${totalSigners}.
                            ${signerOrder > 1 ? '<br><span style="color: #a16207;">Les signataires précédents ont déjà signé.</span>' : ''}
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Role Info -->
                    <p style="margin: 0 0 8px; color: #64748b; font-size: 12px;">
                      Votre rôle : <strong style="color: #374151;">${signerRole}</strong>
                    </p>
                    <p style="margin: 0 0 24px; color: #64748b; font-size: 12px;">
                      Demandé par : <strong style="color: #374151;">${requestedBy}</strong>
                    </p>
                    
                    <!-- CTA Button -->
                    <table role="presentation" style="width: 100%; margin-bottom: 24px;">
                      <tr>
                        <td style="text-align: center;">
                          <a href="#" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                            Accéder au document
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Expiry Warning -->
                    <table role="presentation" style="width: 100%; background-color: #fef2f2; border-radius: 8px;">
                      <tr>
                        <td style="padding: 16px;">
                          <p style="margin: 0; color: #991b1b; font-size: 13px;">
                            ⏰ <strong>Date limite :</strong> Cette demande expire le ${formattedExpiry}.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #64748b; font-size: 12px;">
                      Ce message a été envoyé automatiquement par iCorrespondance.<br>
                      Merci de ne pas y répondre directement.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "iCorrespondance <onboarding@resend.dev>",
        to: [signerEmail],
        subject: `🔏 Signature requise - ${caseReference}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const responseData = await emailResponse.json();

    console.log("Email sent successfully:", responseData);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: responseData.id 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-signature-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
