<?php

namespace App\Modules\WordPress\Exceptions;

use Exception;

class WordPressException extends Exception
{
    public static function connectionFailed(string $message = ''): self
    {
        return new self("اتصال به وردپرس ناموفق بود: {$message}");
    }

    public static function postNotFound(string $type, int|string $identifier): self
    {
        return new self("{$type} با شناسه {$identifier} یافت نشد");
    }

    public static function invalidResponse(string $message = ''): self
    {
        return new self("پاسخ نامعتبر از وردپرس: {$message}");
    }
}
