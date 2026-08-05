package com.peaffee.dto.order;

/** Western Union receiving instructions shown to the customer at checkout. */
public record WuInstructionsResponse(
        String beneficiary, String bank, String account, String swift, String currency, String amount
) {}
