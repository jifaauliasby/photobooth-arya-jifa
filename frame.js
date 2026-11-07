/* ============================================================
 *  FRAME PHOTOBOOTH — Mahoni, Kawung, Sekar
 *  Digambar dengan <canvas> supaya hasil foto sudah berbingkai
 *  saat disimpan. Ukuran dihitung relatif terhadap lebar (E = 1/22.5 lebar).
 * ============================================================ */
(function () {
  var W_ = {
    mahoni: '#6B2A1D', mahoniTua: '#5A2216', cream: '#F6EFE2', garis: '#E9DCC4', orn: '#F3E9D6',
    hijau: '#2F4A3A', hijauMuda: '#DCE5D9', putih: '#FFFFFF'
  };
  var SUDUT_GARIS = ['M2 2v16M2 2h16', 'M2 12c8 0 12-4 12-10', 'M7 7c5 0 7 3 5.5 6s-5.5 2-5.5-1c0-2 2-2.8 3.2-1.8'];
  var SUDUT_ISI = ['M14 2c6 2 8 8 4 12-2-5-3-8-4-12z', 'M2 14c2 6 8 8 12 4-5-2-8-3-12-4z'];
  var GUNUNGAN_LUAR = 'M12 1c4.5 5 9 11 9 17l-9 6-9-6c0-6 4.5-12 9-17z';
  var GUNUNGAN_DALAM = 'M12 6v15M12 10l-3.5 3M12 10l3.5 3M12 14l-4.5 3.5M12 14l4.5 3.5';

  function kanvas(w, h) { var c = document.createElement('canvas'); c.width = Math.round(w); c.height = Math.round(h); return c; }

  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }

  /* Teks rata tengah dengan jarak antarhuruf (dibuat manual agar jalan di semua browser). */
  function teks(ctx, str, cx, cy, font, warna, spasi) {
    ctx.save();
    ctx.font = font; ctx.fillStyle = warna; ctx.textBaseline = 'middle';
    spasi = spasi || 0;
    if (!spasi) { ctx.textAlign = 'center'; ctx.fillText(str, cx, cy); ctx.restore(); return; }
    var ch = Array.from(str), lebar = 0;
    ch.forEach(function (c) { lebar += ctx.measureText(c).width; });
    lebar += spasi * (ch.length - 1);
    var x = cx - lebar / 2;
    ctx.textAlign = 'left';
    ch.forEach(function (c) { ctx.fillText(c, x, cy); x += ctx.measureText(c).width + spasi; });
    ctx.restore();
  }

  function sudut(ctx, x, y, ukuran, warna, cermin) {
    ctx.save();
    ctx.translate(cermin ? x + ukuran : x, y);
    ctx.scale((cermin ? -1 : 1) * ukuran / 40, ukuran / 40);
    ctx.strokeStyle = warna; ctx.lineWidth = 1.4; ctx.lineCap = 'round'; ctx.fillStyle = warna;
    SUDUT_GARIS.forEach(function (d) { ctx.stroke(new Path2D(d)); });
    SUDUT_ISI.forEach(function (d) { ctx.fill(new Path2D(d)); });
    ctx.restore();
  }

  function gunungan(ctx, cx, y, w, h, warna, isiPenuh) {
    ctx.save();
    ctx.translate(cx - w / 2, y); ctx.scale(w / 24, h / 26);
    if (isiPenuh) { ctx.fillStyle = warna; ctx.fill(new Path2D(GUNUNGAN_LUAR)); }
    else {
      ctx.strokeStyle = warna; ctx.lineWidth = 1.3; ctx.stroke(new Path2D(GUNUNGAN_LUAR));
      ctx.lineWidth = 1.1; ctx.lineCap = 'round'; ctx.stroke(new Path2D(GUNUNGAN_DALAM));
    }
    ctx.restore();
  }

  /* Motif batik kawung: empat kelopak lonjong mengelilingi titik tengah. */
  function kawung(ctx, x, y, w, h, sel, isi, garis, tebal, titik) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    var k = sel / 12;
    for (var yy = y; yy < y + h; yy += sel) {
      for (var xx = x; xx < x + w; xx += sel) {
        [[6, 2.6, 1.7, 2.5], [9.4, 6, 2.5, 1.7], [6, 9.4, 1.7, 2.5], [2.6, 6, 2.5, 1.7]].forEach(function (e) {
          ctx.beginPath(); ctx.ellipse(xx + e[0] * k, yy + e[1] * k, e[2] * k, e[3] * k, 0, 0, Math.PI * 2);
          if (isi) { ctx.fillStyle = isi; ctx.fill(); }
          ctx.strokeStyle = garis; ctx.lineWidth = tebal; ctx.stroke();
        });
        ctx.beginPath(); ctx.arc(xx + 6 * k, yy + 6 * k, 0.6 * k * 1.6, 0, Math.PI * 2); ctx.fillStyle = titik; ctx.fill();
      }
    }
    ctx.restore();
  }

  function tulisan(ctx, W, E, y, warnaLabel, warnaNama, warnaTgl, skala, denganGunungan) {
    var s = skala || 1;
    var fl = 0.72 * E * s, fn = 2.5 * E * s, ft = 1 * E * s;
    var P = window.PB || {};
    var nama = (P.PRIA || 'Arya') + ' & ' + (P.WANITA || 'Jifa');
    var tgl = P.TANGGAL_FRAME || '18 · 07 · 2027';
    y += fl * 0.62;
    teks(ctx, 'THE WEDDING OF', W / 2, y, '600 ' + fl + 'px "Cormorant Garamond", Georgia, serif', warnaLabel, fl * 0.32);
    y += fl * 0.62 + fn * 0.55;
    teks(ctx, nama, W / 2, y, fn + 'px "Great Vibes", cursive', warnaNama, 0);
    y += fn * 0.55 + ft * 0.68;
    teks(ctx, tgl, W / 2, y, 'italic 500 ' + ft + 'px "Cormorant Garamond", Georgia, serif', warnaTgl, ft * 0.22);
    if (denganGunungan) {
      ctx.save(); ctx.font = 'italic 500 ' + ft + 'px "Cormorant Garamond", Georgia, serif';
      var lebar = 0; Array.from(tgl).forEach(function (c) { lebar += ctx.measureText(c).width; }); lebar += ft * 0.22 * (Array.from(tgl).length - 1);
      ctx.restore();
      var gw = 0.9 * E * s, gh = 1 * E * s;
      gunungan(ctx, W / 2 - lebar / 2 - gw, y - gh / 2, gw * 0.9, gh, denganGunungan, true);
      gunungan(ctx, W / 2 + lebar / 2 + gw, y - gh / 2, gw * 0.9, gh, denganGunungan, true);
    }
    return y + ft * 0.68;
  }

  /* Lapisan statis frame (dibuat sekali): bawah = latar, atas = ornamen di atas foto. */
  function buatLapisan(W, gaya) {
    var E = W / 22.5, H, rect, bawah, atas, b, a;
    if (gaya === 'Kawung') {
      var pad = 1.1 * E, bw = 0.25 * E, ow = W - 2 * pad, iw = ow - 2 * bw, ih = iw * 1.25, oh = ih + 2 * bw;
      var panelTop = pad + oh + 0.6 * E;
      H = panelTop + 0.5 * E + 0.72 * E * 1.24 + 2.5 * E * 1.1 + E * 1.36 + 0.7 * E;
      rect = { x: pad + bw, y: pad + bw, w: iw, h: ih };
      bawah = kanvas(W, H); b = bawah.getContext('2d');
      b.fillStyle = W_.cream; b.fillRect(0, 0, W, H);
      kawung(b, 0, 0, W, panelTop, 1.375 * E, W_.hijauMuda, W_.hijau, Math.max(0.7, E / 22), W_.mahoni);
      b.fillStyle = W_.putih; b.fillRect(pad, pad, ow, oh);
      b.fillStyle = W_.cream; b.fillRect(0, panelTop, W, H - panelTop);
      b.fillStyle = W_.hijau; b.fillRect(0, panelTop, W, Math.max(1, E / 16));
      tulisan(b, W, E, panelTop + 0.5 * E, W_.hijau, W_.mahoni, W_.hijau, 1, W_.hijau);
      return { W: W, H: Math.round(H), rect: rect, bawah: bawah, atas: null };
    }
    if (gaya === 'Sekar') {
      var p = 0.45 * E, pw = W - 2 * p, ph = pw * 1.4;
      H = ph + 2 * p; rect = { x: p, y: p, w: pw, h: ph };
      bawah = kanvas(W, H); b = bawah.getContext('2d');
      b.fillStyle = W_.hijau; b.fillRect(0, 0, W, H);
      atas = kanvas(W, H); a = atas.getContext('2d');
      sudut(a, p + 0.35 * E, p + 0.35 * E, 2.8 * E, W_.cream, false);
      sudut(a, p + pw - 0.35 * E - 2.8 * E, p + 0.35 * E, 2.8 * E, W_.cream, true);
      var s = 0.8, panelH = 0.45 * E + (0.72 * 1.24 + 2.5 * 1.1 + 1.36) * E * s + 0.55 * E;
      var px = p + 0.9 * E, pwid = pw - 1.8 * E, py = p + ph - 0.9 * E - panelH;
      a.fillStyle = 'rgba(246,239,226,0.94)'; rrect(a, px, py, pwid, panelH, 0.5 * E); a.fill();
      a.strokeStyle = W_.hijau; a.lineWidth = Math.max(1, E / 16); a.stroke();
      tulisan(a, W, E, py + 0.45 * E, W_.hijau, W_.mahoni, W_.hijau, s, null);
      return { W: W, H: Math.round(H), rect: rect, bawah: bawah, atas: atas };
    }
    // Mahoni (bawaan)
    var pd = 0.75 * E, mw = W - 2 * pd, mh = mw * 1.25;
    var yBand = pd + mh + 0.55 * E;
    var yTeks = yBand + 1.5 * E + 0.3 * E;
    var yAkhir = yTeks + 0.72 * E * 1.24 + 2.5 * E * 1.1 + E * 1.36 + 0.2 * E;
    var yStrip = yAkhir + 0.45 * E;
    H = yStrip + 0.9 * E;
    rect = { x: pd, y: pd, w: mw, h: mh };
    bawah = kanvas(W, H); b = bawah.getContext('2d');
    b.fillStyle = W_.mahoni; b.fillRect(0, 0, W, H);
    b.strokeStyle = W_.garis; b.lineWidth = Math.max(1, E / 16);
    rrect(b, 0.32 * E, 0.32 * E, W - 0.64 * E, yStrip - 0.32 * E - 0.2 * E, 0.15 * E); b.stroke();
    gunungan(b, W / 2, yBand, 1.4 * E, 1.5 * E, W_.garis, false);
    tulisan(b, W, E, yTeks, W_.cream, W_.cream, W_.garis, 1, null);
    b.fillStyle = W_.mahoniTua; b.fillRect(0, yStrip, W, H - yStrip);
    kawung(b, 0, yStrip, W, H - yStrip, H - yStrip, null, W_.garis, Math.max(0.8, E / 20), W_.garis);
    atas = kanvas(W, H); a = atas.getContext('2d');
    a.strokeStyle = W_.garis; a.lineWidth = Math.max(1, E / 16);
    a.strokeRect(pd + 0.4 * E, pd + 0.4 * E, mw - 0.8 * E, mh - 0.8 * E);
    sudut(a, pd + 0.35 * E, pd + 0.35 * E, 3 * E, W_.orn, false);
    sudut(a, pd + mw - 0.35 * E - 3 * E, pd + 0.35 * E, 3 * E, W_.orn, true);
    return { W: W, H: Math.round(H), rect: rect, bawah: bawah, atas: atas };
  }

  /* Gambar foto (video / gambar) menutupi kotak foto, seperti object-fit: cover. */
  function tutup(ctx, src, r, cermin) {
    var sw = src.videoWidth || src.naturalWidth || src.width, sh = src.videoHeight || src.naturalHeight || src.height;
    if (!sw || !sh) return false;
    var k = Math.max(r.w / sw, r.h / sh), dw = sw * k, dh = sh * k;
    ctx.save();
    ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
    if (cermin) { ctx.translate(r.x + r.w, 0); ctx.scale(-1, 1); ctx.drawImage(src, (r.w - dw) / 2, r.y + (r.h - dh) / 2, dw, dh); }
    else ctx.drawImage(src, r.x + (r.w - dw) / 2, r.y + (r.h - dh) / 2, dw, dh);
    ctx.restore();
    return true;
  }

  function contohFoto(ctx, r) {
    var g = ctx.createLinearGradient(r.x, r.y, r.x + r.w * 0.3, r.y + r.h);
    g.addColorStop(0, '#D9CFC0'); g.addColorStop(1, '#A8998A');
    ctx.fillStyle = g; ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = '#C3B6A6';
    ctx.beginPath(); ctx.arc(r.x + r.w / 2, r.y + r.h * 0.43, r.w * 0.16, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(r.x + r.w / 2, r.y + r.h, r.w * 0.3, r.h * 0.3, 0, Math.PI, 0); ctx.fill();
  }

  function komposisi(ctx, lap, src, cermin) {
    ctx.drawImage(lap.bawah, 0, 0);
    if (!src || !tutup(ctx, src, lap.rect, cermin)) contohFoto(ctx, lap.rect);
    if (lap.atas) ctx.drawImage(lap.atas, 0, 0);
  }

  function siapFont() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([
      document.fonts.load('48px "Great Vibes"'),
      document.fonts.load('600 20px "Cormorant Garamond"'),
      document.fonts.load('italic 500 20px "Cormorant Garamond"')
    ]).catch(function () {});
  }

  window.PBFrame = { GAYA: ['Mahoni', 'Kawung', 'Sekar'], buatLapisan: buatLapisan, komposisi: komposisi, siapFont: siapFont };
})();
