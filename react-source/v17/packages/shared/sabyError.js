export function sabyError(template, ...args) {
  const msg = template.replace(/%s/g, () => {
    return args.length > 0 ? String(args.shift()) : '';
  });

  console.error(msg);

  if (typeof window !== 'undefined' && typeof window.wsErrorMonitor !== 'undefined' && !window.wsErrorMonitor.reason) {
    const erEvent = new ErrorEvent('ReactError', {
      error: new Error(msg),
      message: `${msg},
             at: ${new Date().toLocaleString()}`,
    });
    window.wsErrorMonitor.onError(erEvent);
  }
}
