# Vercel Email Setup

This project now supports:

- saving contact form messages
- emailing the site owner when a message is sent
- sending an automatic confirmation email back to the visitor

## Recommended service

Use **Resend** with **Vercel**.

## 1. Create a Resend account

Go to `https://resend.com`

## 2. Verify a sending domain

Add and verify a domain in Resend, for example:

- `updates.yourdomain.com`
- `mail.yourdomain.com`
- or your main domain if you prefer

After verification, create a sender email like:

- `Portfolio Contact <hello@yourdomain.com>`

## 3. Get the API key

Create a Resend API key.

## 4. Add environment variables in Vercel

In your Vercel project, add these environment variables:

- `BLOB_READ_WRITE_TOKEN`
- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL`
- `CONTACT_NOTIFICATION_EMAIL`
- `CONTACT_AUTO_REPLY_ENABLED`

## Example values

```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
RESEND_API_KEY=re_xxxxxxxxx
CONTACT_FROM_EMAIL=Portfolio Contact <hello@yourdomain.com>
CONTACT_NOTIFICATION_EMAIL=ashishpanday9818@gmail.com
CONTACT_AUTO_REPLY_ENABLED=true
```

## 5. Redeploy the project

After adding the variables, redeploy the Vercel project.

## 6. Test the form

Send a test message from the deployed contact form.

Expected result:

- the message is stored
- Ashish receives an email notification
- the sender receives an automatic confirmation email

## Notes

- If `RESEND_API_KEY` is missing on Vercel, the deployed form will show an error instead of pretending it worked.
- If `BLOB_READ_WRITE_TOKEN` is missing, messages will not be stored on Vercel.
- During local development without email credentials, messages still save locally and email delivery is skipped.
