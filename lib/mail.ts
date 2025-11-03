import { Resend } from "resend";
import { formatCurrency } from "./utils";

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingEmailData {
  customerName: string;
  customerEmail?: string;
  propertyName: string;
  date: Date;
  startTime: string;
  totalAmount: number;
  deposit: number;
  status: string;
  organizationName: string;
}

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  if (!data.customerEmail) {
    console.log("No customer email provided, skipping email notification");
    return;
  }

  const formattedDate = new Date(data.date).toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #d97706 0%, #92400e 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 30px;
        }
        .booking-details {
            background: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: bold;
            color: #666;
        }
        .value {
            color: #333;
        }
        .footer {
            background: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background: #d97706;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>تأكيد الحجز</h1>
            <p>${data.organizationName}</p>
        </div>
        <div class="content">
            <p>عزيزي ${data.customerName}،</p>
            <p>نشكرك على حجزك! تم تأكيد حجزك بنجاح.</p>
            
            <div class="booking-details">
                <h2 style="margin-top: 0;">تفاصيل الحجز</h2>
                <div class="detail-row">
                    <span class="label">العقار:</span>
                    <span class="value">${data.propertyName}</span>
                </div>
                <div class="detail-row">
                    <span class="label">التاريخ:</span>
                    <span class="value">${formattedDate}</span>
                </div>
                <div class="detail-row">
                    <span class="label">الوقت:</span>
                    <span class="value">${data.startTime}</span>
                </div>
                <div class="detail-row">
                    <span class="label">المبلغ الإجمالي:</span>
                    <span class="value">${formatCurrency(
                      data.totalAmount,
                      "SAR"
                    )}</span>
                </div>
                <div class="detail-row">
                    <span class="label">العربون:</span>
                    <span class="value">${formatCurrency(
                      data.deposit,
                      "SAR"
                    )}</span>
                </div>
                <div class="detail-row">
                    <span class="label">الحالة:</span>
                    <span class="value">${getStatusInArabic(data.status)}</span>
                </div>
            </div>
            
            <p>إذا كان لديك أي استفسار، يرجى التواصل معنا.</p>
            <p>نتطلع لخدمتك!</p>
        </div>
        <div class="footer">
            <p>© 2024 ${data.organizationName}. جميع الحقوق محفوظة.</p>
            <p>هذه رسالة تلقائية، يرجى عدم الرد عليها مباشرة.</p>
        </div>
    </div>
</body>
</html>
  `;

  try {
    await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "Aurora Chalet <onboarding@resend.dev>",
      to: data.customerEmail,
      subject: `تأكيد حجزك - ${data.propertyName}`,
      html,
    });

    console.log(`Booking confirmation email sent to ${data.customerEmail}`);
  } catch (error) {
    console.error("Failed to send booking confirmation email:", error);
    throw error;
  }
}

export async function sendBookingStatusChangeEmail(data: BookingEmailData) {
  if (!data.customerEmail) {
    console.log("No customer email provided, skipping email notification");
    return;
  }

  const formattedDate = new Date(data.date).toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #d97706 0%, #92400e 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .content {
            padding: 30px;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin: 10px 0;
        }
        .footer {
            background: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>تحديث حالة الحجز</h1>
            <p>${data.organizationName}</p>
        </div>
        <div class="content">
            <p>عزيزي ${data.customerName}،</p>
            <p>تم تحديث حالة حجزك لـ <strong>${
              data.propertyName
            }</strong> بتاريخ <strong>${formattedDate}</strong>.</p>
            
            <div style="text-align: center; margin: 20px 0;">
                <span class="status-badge" style="background: ${getStatusColor(
                  data.status
                )}; color: white;">
                    ${getStatusInArabic(data.status)}
                </span>
            </div>
            
            <p>إذا كان لديك أي استفسار، يرجى التواصل معنا.</p>
        </div>
        <div class="footer">
            <p>© 2024 ${data.organizationName}. جميع الحقوق محفوظة.</p>
        </div>
    </div>
</body>
</html>
  `;

  try {
    await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "Aurora Chalet <onboarding@resend.dev>",
      to: data.customerEmail,
      subject: `تحديث حالة حجزك - ${data.propertyName}`,
      html,
    });

    console.log(`Status change email sent to ${data.customerEmail}`);
  } catch (error) {
    console.error("Failed to send status change email:", error);
    throw error;
  }
}

function getStatusInArabic(status: string): string {
  const statusMap: { [key: string]: string } = {
    PENDING: "قيد الانتظار",
    CONFIRMED: "مؤكد",
    PAID: "مدفوع",
    CANCELLED: "ملغي",
    NO_SHOW: "لم يحضر",
    COMPLETED: "مكتمل",
  };
  return statusMap[status] || status;
}

function getStatusColor(status: string): string {
  const colorMap: { [key: string]: string } = {
    PENDING: "#6b7280",
    CONFIRMED: "#3b82f6",
    PAID: "#10b981",
    CANCELLED: "#ef4444",
    NO_SHOW: "#f97316",
    COMPLETED: "#14b8a6",
  };
  return colorMap[status] || "#6b7280";
}
