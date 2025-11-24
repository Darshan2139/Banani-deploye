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
      const error = await response.json();
      console.error('Email error:', error);
    }
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}
