// src/lib/utils/sendEmail.ts
import nodemailer from 'nodemailer';

type TicketEmailData = {
  to: string;
  name: string;
  userId: string;
  qrCode: string; // This is the complete ticket image as base64
  eventName: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
};

export async function sendTicketEmail(data: TicketEmailData): Promise<boolean> {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Extract base64 data from the QR code (which is actually the full ticket)
    // Format: "data:image/png;base64,iVBORw0KGgoAAAANS..."
    const base64Data = data.qrCode.split(',')[1];

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: data.to,
      subject: `Your ticket • ${data.eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #7c3aed;">🎫 Your Ticket for ${data.eventName}</h2>
          
          <p style="font-size: 16px; color: #333;">Hi ${data.name},</p>
          
          <p style="font-size: 14px; color: #666;">
            Show this QR at the entry gate (screenshot works too).
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket ID:</strong> ${data.userId}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${data.eventDate} • <strong>Time:</strong> ${data.eventTime}</p>
            <p style="margin: 5px 0;"><strong>Venue:</strong> ${data.venueName}</p>
            <p style="margin: 5px 0; color: #666;">${data.venueAddress}</p>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            Your ticket is attached to this email. You can also download it from the attachment below.
          </p>
          
          <p style="font-size: 14px; color: #7c3aed; margin-top: 30px;">
            See you at the event!
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `ticket-${data.userId}.png`,
          content: base64Data,
          encoding: 'base64',
          contentType: 'image/png',
        },
      ],
    };

    console.log('📧 Attempting to send email to:', data.to);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}