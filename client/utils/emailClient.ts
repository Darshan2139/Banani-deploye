export async function sendEmail(
  type: 'signup' | 'password-reset' | 'login' | 'new-entry' | 'monthly-earnings' | 'payment-due',
  to: string,
  firstName: string,
  additionalData: Record<string, string | number> = {}
): Promise<void> {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        to,
        firstName,
        ...additionalData,
      }),
    });

    if (!response.ok) {
      const raw = await response.text();
      let errorPayload: any;
      try {
        errorPayload = JSON.parse(raw);
      } catch {
        errorPayload = { error: raw || 'Unknown server error' };
      }

      console.error('Email error:', errorPayload);
      throw new Error(errorPayload.error || 'Email request failed');
    }
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
