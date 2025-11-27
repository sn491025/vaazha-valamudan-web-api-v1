import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Razorpay from "razorpay";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";
import * as crypto from "crypto";

@Injectable()
export class RazorpayService {
    private razorpay: Razorpay;
    private razorpayKey: string;
    private razorpaySecret: string;
    private razorpayWebhookSecret: string;

    constructor(private readonly configService: ConfigService) {
        this.razorpayKey = this.configService.get<string>('RAZORPAY_KEY_ID') || '';
        this.razorpaySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || '';
        this.razorpayWebhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET') || '';

        if (this.razorpayKey && this.razorpaySecret) {
            this.razorpay = new Razorpay({
                key_id: this.razorpayKey,
                key_secret: this.razorpaySecret,
            });
        } else {
            console.warn("Razorpay credentials not found. Payment service disabled.");
        }
    }

    async createOrder(
        amount: number,
        currency: string = "INR",
        receipt: string,
        notes: any
    ) {
        if (!this.razorpay) {
            throw new Error("Razorpay not initialized. Check credentials.");
        }
        return await this.razorpay.orders.create({
            amount: amount * 100,
            currency,
            receipt,
            notes
        });
    }

    async verifySignature(order_id: string, payment_id: string, signature: string) {
        return validatePaymentVerification(
            { order_id, payment_id },
            signature,
            this.razorpaySecret,
        );
    }

    async verifyWebhookSignature(rawBody: string, receivedSignature: string) {
        const expected = validateWebhookSignature(
            rawBody,
            receivedSignature,
            this.razorpayWebhookSecret,
        );

        if (!expected) {
            throw new UnauthorizedException("Invalid webhook signature");
        }
        return true;
    }

    async getPaymentById(paymentId: string) {
        return await this.razorpay.payments.fetch(paymentId);
    }

    async getOrderById(orderId: string) {
        return await this.razorpay.orders.fetch(orderId);
    }

    async refundPayment(paymentId: string, amount?: number) {
        return await this.razorpay.payments.refund(paymentId, {
            amount: amount ? amount * 100 : undefined, // omit for full refund
        });
    }
}
