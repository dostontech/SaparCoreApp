// External-integration routes — Webhooks & third-party connectors.
const express = require('express');
const router = express.Router();
const apiKeyAuth = require('../middleware/apiKeyAuth');
const externalController = require('../controllers/externalController');
const uzbekPaymentGatewaysController = require('../controllers/uzbekPaymentGatewaysController');

// Public — token in body is the auth; verified by HMAC against the shared secret.
router.post('/sso/exchange', externalController.ssoExchange);

// Server-to-server — bearer-token gated.
router.post('/customers', apiKeyAuth, externalController.upsertCustomer);

// 🇺🇿 Payme Business JSON-RPC 2.0 Webhook endpoint
router.post('/payme', uzbekPaymentGatewaysController.handlePaymeWebhook);
router.post('/payme/webhook', uzbekPaymentGatewaysController.handlePaymeWebhook);

// 🇺🇿 Click Merchant Webhook endpoints (Prepare & Complete)
router.post('/click/prepare', uzbekPaymentGatewaysController.handleClickPrepare);
router.post('/click/complete', uzbekPaymentGatewaysController.handleClickComplete);

// 🇺🇿 UzQR National Unified QR Webhook endpoint (Central Bank / EOPC / Acquiring Bank)
router.post('/uzqr/webhook', uzbekPaymentGatewaysController.handleUzQrWebhook);
router.post('/uzqr', uzbekPaymentGatewaysController.handleUzQrWebhook);

module.exports = router;
