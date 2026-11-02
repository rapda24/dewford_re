(() => {
  const isEnglish = location.pathname.startsWith('/en/');
  document.querySelectorAll('.dewford-about-form').forEach(form => {
  const button = form.querySelector('[type="submit"]');
  const status = form.querySelector('[role="status"]');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity() || button.disabled) return;
    const fields = Object.fromEntries(new FormData(form));
    fields.consent = form.elements.consent.checked;
    button.disabled = true;
    status.textContent = isEnglish ? 'Submitting your inquiry…' : '상담 신청을 접수하고 있습니다.';
    try {
      await DewfordAPI.inquire(fields);
      form.reset();
      status.textContent = isEnglish
        ? 'Your inquiry has been submitted. We will contact you using the details you provided.'
        : '상담 신청이 접수되었습니다. 남겨주신 연락처로 안내드리겠습니다.';
    } catch {
      status.textContent = isEnglish
        ? `We could not submit your inquiry. Please try again later or call ${window.DewfordSiteInfo?.phone||'02-6401-1012'}.`
        : `신청이 접수되지 않았습니다. 잠시 후 다시 시도하거나 ${window.DewfordSiteInfo?.phone||'02-6401-1012'}로 연락해 주세요.`;
    } finally { button.disabled = false; }
  });
  });
})();
