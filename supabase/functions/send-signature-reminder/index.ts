import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignatureReminderRequest {
  signerName: string;
  signerEmail: string;
  signerRole: string;
  documentNames: string[];
  caseReference: string;
  caseTitle: string;
  expiresAt: string;
  daysRemaining: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: SignatureReminderRequest = await req.json();
    
    console.log("Sending signature reminder to:", payload.signerEmail);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const {
      signerName,
      signerEmail,
      signerRole,
      documentNames,
      caseReference,
      caseTitle,
      expiresAt,
      daysRemaining,
    } = payload;

    const formattedExpiry = new Date(expiresAt).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const documentList = documentNames.map(name => `<li>${name}</li>`).join('');
    
    // Determine urgency styling based on days remaining
    const isUrgent = daysRemaining <= 1;
    const urgencyColor = isUrgent ? '#dc2626' : '#f59e0b';
    const urgencyBg = isUrgent ? '#fef2f2' : '#fffbeb';
    const urgencyIcon = isUrgent ? '🚨' : '⏰';
    const urgencyText = isUrgent 
      ? `URGENT: Il vous reste moins de ${daysRemaining <= 0 ? '24 heures' : `${daysRemaining} jour(s)`} pour signer!`
      : `Il vous reste ${daysRemaining} jour(s) pour signer.`;

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
                  <td style="background: linear-gradient(135deg, ${urgencyColor} 0%, ${isUrgent ? '#b91c1c' : '#d97706'} 100%); padding: 32px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                      ${urgencyIcon} Rappel de signature
                    </h1>
                  </td>
                </tr>
                
                <!-- Urgency Banner -->
                <tr>
                  <td style="background-color: ${urgencyBg}; padding: 16px 32px; border-bottom: 1px solid ${urgencyColor}20;">
                    <p style="margin: 0; color: ${urgencyColor}; font-size: 16px; font-weight: 600; text-align: center;">
                      ${urgencyIcon} ${urgencyText}
                    </p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 32px;">
                    <p style="margin: 0 0 16px; color: #374151; font-size: 16px;">
                      Bonjour <strong>${signerName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 24px; color: #374151; font-size: 16px;">
                      Nous vous rappelons qu'une demande de signature vous attend et approche de sa date d'expiration.
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
                      Document(s) en attente de signature :
                    </p>
                    <ul style="margin: 0 0 24px; padding-left: 20px; color: #374151; font-size: 14px;">
                      ${documentList}
                    </ul>
                    
                    <!-- Role Info -->
                    <p style="margin: 0 0 24px; color: #64748b; font-size: 12px;">
                      Votre rôle : <strong style="color: #374151;">${signerRole}</strong>
                    </p>
                    
                    <!-- CTA Button -->
                    <table role="presentation" style="width: 100%; margin-bottom: 24px;">
                      <tr>
                        <td style="text-align: center;">
                          <a href="#" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                            Signer maintenant
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Expiry Warning -->
                    <table role="presentation" style="width: 100%; background-color: ${urgencyBg}; border-radius: 8px; border: 2px solid ${urgencyColor};">
                      <tr>
                        <td style="padding: 16px;">
                          <p style="margin: 0; color: ${urgencyColor}; font-size: 14px; font-weight: 600;">
                            ${urgencyIcon} <strong>Date limite :</strong> ${formattedExpiry}
                          </p>
                          <p style="margin: 8px 0 0; color: #64748b; font-size: 13px;">
                            Passé ce délai, la demande de signature expirera automatiquement.
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
        subject: `${isUrgent ? '🚨 URGENT' : '⏰'} Rappel: Signature en attente - ${caseReference}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const responseData = await emailResponse.json();

    console.log("Reminder email sent successfully:", responseData);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: responseData.id 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-signature-reminder:", error);
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
