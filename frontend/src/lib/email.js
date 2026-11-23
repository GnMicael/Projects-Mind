import emailjs from '@emailjs/browser';

const cfg = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};
export const emailConfigured = !!(cfg.serviceId && cfg.templateId && cfg.publicKey);
const CAT = { bug: 'Erro', melhoria: 'Melhoria', recurso: 'Novo recurso' };

// O destinatário NÃO é enviado pelo app: fica fixo no template do EmailJS,
// assim ninguém consegue usar sua conta para mandar e-mail a terceiros.
export async function sendFeedbackEmail({ category, subject, description, projectContext, name, email, uid }) {
  if (!emailConfigured) return false;
  await emailjs.send(cfg.serviceId, cfg.templateId, {
    category: CAT[category] || category,
    subject,
    message: description,
    project_context: projectContext || '—',
    from_name: name || '—',
    from_email: email,
    reply_to: email,
    user_id: uid,
    sent_at: new Date().toLocaleString('pt-BR'),
  }, { publicKey: cfg.publicKey });
  return true;
}
