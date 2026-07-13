<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogAktivitas extends Model
{
    // Tentukan nama tabelnya secara eksplisit karena Laravel terkadang mendeteksi jamak yang tidak sesuai bahasa Indonesia
    protected $table = 'log_aktivitas';

    protected $fillable = [
        'user_id',
        'jenis_aktivitas',
        'deskripsi',
        'alamat_ip',
    ];

    /**
     * Relasi: Catatan log ini DIPICU OLEH seorang User (Admin).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
