import { Resend } from 'resend';

let resendInstance: Resend | null = null;

/**
 * Obtém uma instância do cliente Resend
 */
export const useResend = () => {
    if (!resendInstance) {
        const config = useRuntimeConfig();
        const apiKey = config.resendApiKey || process.env.RESEND_API_KEY;

        if (!apiKey) {
            console.error('[Resend] API Key não configurada');
            return null;
        }

        resendInstance = new Resend(apiKey);
    }
    return resendInstance;
};

/**
 * Envia um e-mail simplificado
 */
export const sendEmail = async (options: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
}) => {
    const resend = useResend();
    if (!resend) return { error: 'Resend não configurado' };

    const config = useRuntimeConfig();
    const from = config.mailerSenderEmail || process.env.MAILER_SENDER_EMAIL || 'onboarding@resend.dev';

    try {
        const { data, error } = await resend.emails.send({
            from,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text || options.html.replace(/<[^>]*>?/gm, ''),
        });

        if (error) {
            console.error('[Resend] Erro ao enviar e-mail:', error);
            return { error };
        }

        return { data };
    } catch (err: any) {
        console.error('[Resend] Exceção ao enviar e-mail:', err);
        return { error: err.message };
    }
};
