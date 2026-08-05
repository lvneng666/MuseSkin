package com.peaffee.exception;

/** Uniform error body: {"error": "message"}. */
public record ApiError(String error) {}
