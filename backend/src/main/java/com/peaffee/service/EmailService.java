package com.peaffee.service;

import com.peaffee.config.AppProperties;
import com.peaffee.entity.Inquiry;
import com.peaffee.entity.Order;
import com.peaffee.entity.OrderItem;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final SpringTemplateEngine templateEngine;
    private final AppProperties app;
    private final String smtpHost;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider,
                        SpringTemplateEngine templateEngine,
                        AppProperties app,
                        @Value("${spring.mail.host:}") String smtpHost) {
        this.mailSenderProvider = mailSenderProvider;
        this.templateEngine = templateEngine;
        this.app = app;
        this.smtpHost = smtpHost;
    }

    @Async("emailExecutor")
    public void sendResetPasswordEmail(String to, String token) {
        String resetUrl = app.baseUrl() + "/reset-password?token=" + token;
        send(to, "Reset your Peaffee password", "email/reset-password", Map.of("resetUrl", resetUrl));
    }

    @Async("emailExecutor")
    public void sendOrderConfirmationEmail(Order order, List<OrderItem> items) {
        send(order.getCustomerEmail(), "Order " + order.getOrderNo() + " received", "email/order-confirmation",
                Map.of("order", order, "items", items, "isWu", order.getPaymentMethod() == Order.PaymentMethod.western_union));
    }

    @Async("emailExecutor")
    public void sendPaymentReceivedEmail(Order order, List<OrderItem> items) {
        send(order.getCustomerEmail(), "Payment received — order " + order.getOrderNo(), "email/payment-received",
                Map.of("order", order, "items", items));
    }

    @Async("emailExecutor")
    public void sendOrderShippedEmail(Order order) {
        send(order.getCustomerEmail(), "Your order " + order.getOrderNo() + " is on its way", "email/order-shipped",
                Map.of("order", order));
    }

    @Async("emailExecutor")
    public void sendInquiryNotificationEmail(Inquiry inquiry) {
        String to = app.adminNotifyEmail();
        if (to == null || to.isBlank()) return;
        String adminUrl = app.baseUrl() + "/admin#/inquiries";
        send(to, "New care inquiry — " + inquiry.getName(), "email/inquiry-notification",
                Map.of("inquiry", inquiry, "adminUrl", adminUrl));
    }

    private void send(String to, String subject, String template, Map<String, Object> model) {
        if (smtpHost == null || smtpHost.isBlank()) {
            log.info("[mail:disabled] to={} subject={}", to, subject);
            return;
        }
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null) {
            log.info("[mail:disabled] to={} subject={}", to, subject);
            return;
        }
        try {
            Context context = new Context(java.util.Locale.ENGLISH, model);
            String html = templateEngine.process(template, context);
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(app.adminNotifyEmail(), "Peaffee");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            sender.send(message);
            log.info("[mail:sent] to={} subject={}", to, subject);
        } catch (Exception e) {
            log.error("[mail:error] to={} subject={} err={}", to, subject, e.getMessage());
        }
    }
}
