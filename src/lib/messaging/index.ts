import twilio, { Twilio } from 'twilio';
import { ghostPhoneFetch } from '@/lib/config/services';

type MessagePayload = {
  phone: string;
  body: string;
};

type AvailabilityPayload = {
  phone: string;
  vendorName: string;
  requestedTime?: string;
  partySize?: number;
};

export class MessagingService {
  private static instance: MessagingService;
  private twilioClient: Twilio | null = null;

  private constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
    }
  }

  public static getInstance(): MessagingService {
    if (!MessagingService.instance) {
      MessagingService.instance = new MessagingService();
    }
    return MessagingService.instance;
  }

  async sendMessage({ phone, body }: MessagePayload, provider: 'twilio' | 'ghost' = 'twilio') {
    const formattedPhone = phone.startsWith('+') ? phone : `+51${phone.replace(/\D/g, '')}`;

    if (provider === 'twilio' && this.twilioClient) {
      return await this.twilioClient.messages.create({
        body,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'}`,
        to: `whatsapp:${formattedPhone}`,
      });
    }

    return await ghostPhoneFetch('/api/message/send', { phone, message: body });
  }

  async askAvailability(payload: AvailabilityPayload, provider: 'twilio' | 'ghost' = 'twilio') {
    if (provider === 'twilio' && this.twilioClient) {
      const body = `Hello ${payload.vendorName}! 🛎️\n\nUnlockCusco Concierge here. We have a client requesting a booking:\nTime: ${payload.requestedTime || 'As soon as possible'}\nParty Size: ${payload.partySize || '1'}\n\nPlease reply YES to confirm availability or NO if you are full.`;
      return this.sendMessage({ phone: payload.phone, body }, 'twilio');
    }

    return await ghostPhoneFetch('/api/message/ask-availability', payload);
  }
}

export const messaging = MessagingService.getInstance();
