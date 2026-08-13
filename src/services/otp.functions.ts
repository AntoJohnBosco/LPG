import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requestOtpInternal, verifyOtpInternal } from "./otp.server";

const requestOtpSchema = z.object({
  countryCode: z.string().regex(/^\+[1-9]\d{0,2}$/),
  phone: z.string().regex(/^\d{7,14}$/),
});

const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/),
  otp: z.string().regex(/^\d{6}$/),
});

export const requestOtp = createServerFn({ method: "POST" })
  .validator(requestOtpSchema)
  .handler(async ({ data }) => {
    return requestOtpInternal(data.countryCode, data.phone);
  });

export const verifyOtp = createServerFn({ method: "POST" })
  .validator(verifyOtpSchema)
  .handler(async ({ data }) => {
    verifyOtpInternal(data.phone, data.otp);
    return { success: true };
  });
