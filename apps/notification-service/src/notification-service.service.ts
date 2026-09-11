import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  getHello(): string {
    this.logger.log(`Executing getHello in Notification Service`);
    return 'Hello World!';
  }

  /**
   * Processes transactional outbox events dispatched by OutboxRelayService
   */
  async processOutboxEvent(event: { id: string; eventType: string; payload: Record<string, any>; createdAt: Date }) {
    this.logger.log(`Processing Outbox Event ID ${event.id} of type: ${event.eventType}`);

    let htmlContent = '';
    let subject = '';

    switch (event.eventType) {
      case 'leave.submitted':
      case 'leave.approved':
      case 'leave.rejected':
      case 'leave.verified':
        subject = `Leave Request Notification: ${event.eventType.toUpperCase()}`;
        htmlContent = this.renderLeaveStatusEmail(event.eventType, event.payload);
        break;

      case 'payroll.executed':
        subject = `Monthly Payslip Available - Period ${event.payload?.period}`;
        htmlContent = this.renderPayslipAvailableEmail(event.payload);
        break;

      case 'employee.onboarded':
      case 'tenant.registered':
        subject = `Welcome to WorkforcePulse Enterprise Platform`;
        htmlContent = this.renderWelcomeEmail(event.payload);
        break;

      default:
        subject = `WorkforcePulse System Event Notification: ${event.eventType}`;
        htmlContent = `<div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Event Notification: ${event.eventType}</h2>
          <pre>${JSON.stringify(event.payload, null, 2)}</pre>
        </div>`;
        break;
    }

    this.logger.log(`Rendered Email Subject: "${subject}" for event ${event.id}`);
    this.logger.log(`Simulating SMTP dispatch for event ID ${event.id}...`);

    return {
      success: true,
      eventId: event.id,
      eventType: event.eventType,
      deliveredAt: new Date().toISOString(),
    };
  }

  /**
   * Renders HTML template for Employee Welcome / Onboarding
   */
  renderWelcomeEmail(payload: Record<string, any>): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155; }
          .header { font-size: 24px; font-weight: bold; color: #38bdf8; margin-bottom: 16px; }
          .content { font-size: 16px; line-height: 1.6; color: #cbd5e1; }
          .highlight { background: #0f172a; padding: 16px; border-radius: 8px; border-left: 4px solid #38bdf8; margin: 20px 0; font-mono; }
          .footer { margin-top: 32px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">Welcome to WorkforcePulse</div>
          <div class="content">
            <p>Hello,</p>
            <p>Your account on the WorkforcePulse Enterprise Platform has been successfully created.</p>
            <div class="highlight">
              <strong>Employee ID:</strong> ${payload.employeeId || 'N/A'}<br/>
              <strong>Email:</strong> ${payload.email || 'N/A'}<br/>
              <strong>Tenant ID:</strong> ${payload.tenantId || 'N/A'}
            </div>
            <p>Please login to your employee portal to manage your profile, view leave balances, and access payslips.</p>
          </div>
          <div class="footer">WorkforcePulse Enterprise Platform &copy; 2026. All rights reserved.</div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Renders HTML template for Leave Request Status Alerts
   */
  renderLeaveStatusEmail(eventType: string, payload: Record<string, any>): string {
    const statusColor = eventType.includes('approved') || eventType.includes('verified') ? '#4ade80' : eventType.includes('rejected') ? '#f87171' : '#38bdf8';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155; }
          .header { font-size: 22px; font-weight: bold; color: ${statusColor}; margin-bottom: 16px; }
          .content { font-size: 16px; line-height: 1.6; color: #cbd5e1; }
          .card { background: #0f172a; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #334155; }
          .footer { margin-top: 32px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">Leave Request Alert: ${eventType.replace('leave.', '').toUpperCase()}</div>
          <div class="content">
            <p>Your leave request status has been updated.</p>
            <div class="card">
              <p><strong>Leave Request ID:</strong> ${payload.leaveRequestId}</p>
              <p><strong>Total Days:</strong> ${payload.totalDays || 'N/A'}</p>
              <p><strong>Date Range:</strong> ${payload.startDate || ''} to ${payload.endDate || ''}</p>
              ${payload.reason ? `<p><strong>Reason:</strong> ${payload.reason}</p>` : ''}
            </div>
          </div>
          <div class="footer">WorkforcePulse Enterprise Platform &copy; 2026</div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Renders HTML template for Monthly Payslip Notification
   */
  renderPayslipAvailableEmail(payload: Record<string, any>): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155; }
          .header { font-size: 24px; font-weight: bold; color: #4ade80; margin-bottom: 16px; }
          .content { font-size: 16px; line-height: 1.6; color: #cbd5e1; }
          .stats { display: flex; justify-content: space-between; background: #0f172a; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #334155; }
          .footer { margin-top: 32px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">Monthly Payslip Ready</div>
          <div class="content">
            <p>Payroll run for period <strong>${payload.period}</strong> has been successfully executed.</p>
            <div class="stats">
              <div><strong>Employees Processed:</strong> ${payload.employeeCount}</div>
              <div><strong>Total Gross:</strong> $${payload.totalGross}</div>
              <div><strong>Total Net:</strong> $${payload.totalNet}</div>
            </div>
            <p>Your itemized payslip is now available for view and download in the Employee Portal.</p>
          </div>
          <div class="footer">WorkforcePulse Payroll Engine &copy; 2026</div>
        </div>
      </body>
      </html>
    `;
  }
}
