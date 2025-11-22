export interface OtpSender {
  send(recipient: string, code: string, purposeText: string): Promise<void>;
}
