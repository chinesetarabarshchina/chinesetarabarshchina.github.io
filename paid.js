// Возврат после оплаты (?paid=ID): ждём, пока вебхук Platega выдаст доступ, затем сразу открываем главы.
(function () {
  var m = location.search.match(/[?&]paid=(\d+)/);
  if (!m) return;
  var bookId = Number(m[1]);
  var lib = window.supabase;
  if (!lib || !lib.createClient) return;

  var sb = lib.createClient(
    'https://dytcthyberbwhnyyiadg.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dGN0aHliZXJid2hueXlpYWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDY0MjIsImV4cCI6MjA5MTY4MjQyMn0.kvEl7LTjx0YEsZ0BYaZSOKjyig8JaByqE7KRe6Fv9BM',
    { auth: { persistSession: true, autoRefreshToken: false, detectSessionInUrl: false } }
  );

  var bar = document.createElement('div');
  bar.style.cssText =
    'position:fixed;left:12px;right:12px;bottom:16px;z-index:99999;padding:14px 16px;border-radius:12px;' +
    'background:#8b1a1a;color:#fff;font:500 16px Georgia,serif;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.3)';
  bar.textContent = 'Платёж получен. Открываем доступ…';
  document.body.appendChild(bar);

  var tries = 0, MAX = 60; // 60 попыток по 2 секунды = 2 минуты

  async function check() {
    tries++;
    try {
      var s = await sb.auth.getSession();
      var session = s && s.data && s.data.session;
      if (session) {
        var r = await sb.from('book_access').select('book_id')
          .eq('user_id', session.user.id).eq('book_id', bookId).maybeSingle();
        if (r && r.data) {
          bar.textContent = 'Доступ открыт ✓';
          setTimeout(function () { location.replace(location.origin + location.pathname); }, 400);
          return;
        }
      }
    } catch (e) { /* пробуем ещё раз */ }
    if (tries >= MAX) {
      bar.textContent = 'Оплата ещё обрабатывается. Обновите страницу через минуту. Если доступ не откроется, напишите на chinesetarabarshchina@gmail.com';
      return;
    }
    setTimeout(check, 2000);
  }
  check();
})();
