/**
 * Client half of the social preview bundle.
 *
 * Registers one Settings page ("social preview") into `settings.section`: it
 * uploads an image, validates the 640x320 minimum, previews the 2:1 social
 * card and keeps the chosen image in this browser's localStorage.
 */
window.__ModuleLoader__.load({
  id: 'dsh-plugin-social-preview',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'social-preview';
    const STORAGE_KEY = 'dsh.social-preview.image.v1';
    const MIN_WIDTH = 640;
    const MIN_HEIGHT = 320;
    const BEST_WIDTH = 1280;
    const BEST_HEIGHT = 640;
    const ACCEPTED_MIME = /^image\/(png|jpeg|webp)$/;

    const ZH = {
      nav: '社交预览',
      title: '社交预览',
      intro: '上传一张图片，用于该工作区被分享为链接时的展示。图片应至少为 640 × 320px（最佳显示为 1280 × 640px）。',
      preview: '预览效果',
      dropTitle: '点击上传，或把图片拖到这里',
      dropHint: '支持 PNG、JPG、WebP',
      upload: '上传图片',
      replace: '更换图片',
      remove: '移除',
      download: '下载模板',
      empty: '还没有图片',
      dims: '{w} × {h} · {size}',
      ok: '尺寸符合最佳要求',
      warn: '尺寸可用，建议使用 1280 × 640',
      tooSmall: '图片至少需要 640 × 320，当前为 {w} × {h}',
      tooSmallBadge: '尺寸不足',
      errorType: '仅支持 PNG、JPG、WebP 图片',
      errorRead: '无法读取这张图片',
      errorStorage: '图片体积过大，无法保存到本地，仅本次会话有效',
      templateTitle: '社交预览',
      templateSubtitle: '把这段文字换成你自己的画面',
    };

    const EN = {
      nav: 'Social preview',
      title: 'Social preview',
      intro: 'Upload an image to use when this workspace is shared as a link. Images should be at least 640 × 320px (best displayed at 1280 × 640px).',
      preview: 'Preview',
      dropTitle: 'Click to upload, or drag an image here',
      dropHint: 'PNG, JPG or WebP',
      upload: 'Upload image',
      replace: 'Replace image',
      remove: 'Remove',
      download: 'Download template',
      empty: 'No image yet',
      dims: '{w} × {h} · {size}',
      ok: 'Meets the recommended size',
      warn: 'Usable, but 1280 × 640 is recommended',
      tooSmall: 'At least 640 × 320 is required — this image is {w} × {h}',
      tooSmallBadge: 'Too small',
      errorType: 'Only PNG, JPG and WebP images are supported',
      errorRead: 'This image could not be read',
      errorStorage: 'The image is too large to save locally, so it only lasts for this session',
      templateTitle: 'Social preview',
      templateSubtitle: 'Replace this text with your own artwork',
    };

    const CSS = `
.spSection{display:flex;flex-direction:column;gap:16px;width:100%;padding-bottom:32px;box-sizing:border-box}
.spHeading{margin:0;color:var(--dsw-alias-label-primary);font-size:20px;font-weight:600;line-height:28px}
.spIntro{margin:0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;max-width:640px}
.spDrop{display:flex;flex-direction:column;gap:12px;padding:16px;box-sizing:border-box;width:100%;
  border:.5px dashed var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1);
  cursor:pointer;outline:none;transition:background .15s ease,border-color .15s ease}
.spDrop:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08))}
.spDrop:focus-visible{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 1px var(--dsw-alias-brand-primary)}
.spDropOver{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08))}
.spCard{position:relative;width:100%;max-width:600px;margin:0 auto;aspect-ratio:2/1;overflow:hidden;display:flex;
  align-items:center;justify-content:center;border-radius:10px;border:.5px solid var(--dsw-alias-border-l2);
  background:var(--dsw-alias-bg-layer-2)}
.spCardImg{width:100%;height:100%;object-fit:cover;display:block}
.spEmpty{display:flex;flex-direction:column;align-items:center;gap:6px;padding:0 24px;text-align:center;
  color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}
.spEmptyTitle{color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px}
.spEmptyHint{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.spMeta{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.spDims{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;font-variant-numeric:tabular-nums}
.spBadge{font-size:12px;line-height:18px;padding:2px 8px;border-radius:999px;border:.5px solid currentColor;white-space:nowrap}
.spBadgeOk{color:var(--dsw-alias-state-success-primary)}
.spBadgeWarn{color:var(--dsw-alias-state-warn-primary)}
.spBadgeBad{color:var(--dsw-alias-state-error-primary)}
.spError{margin:0;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px}
.spActions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.spBtn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:32px;padding:0 14px;
  border-radius:8px;font:inherit;font-size:13px;line-height:20px;cursor:pointer;box-sizing:border-box;
  border:.5px solid transparent;background:transparent;color:var(--dsw-alias-label-primary)}
.spBtn:disabled{opacity:.45;cursor:not-allowed}
.spBtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.spBtnPrimary{background:var(--dsw-alias-brand-primary);color:#fff;border-color:transparent}
.spBtnPrimary:hover:not(:disabled){opacity:.88}
.spBtnGhost{border-color:var(--dsw-alias-border-l2);background:transparent}
.spBtnGhost:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08))}
.spBtnDanger{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-border-l2)}
.spBtnDanger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08))}
.spVisuallyHidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;
  clip:rect(0 0 0 0);white-space:nowrap;border:0}
.spLabel{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;letter-spacing:.02em}
`;

    /** Read one file as a data URL. */
    function readAsDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error || new Error('read failed'));
        reader.readAsDataURL(file);
      });
    }

    /** Decode a data URL and report its natural pixel size. */
    function measure(dataUrl) {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => reject(new Error('decode failed'));
        image.src = dataUrl;
      });
    }

    /** Human readable byte size. */
    function formatBytes(bytes) {
      if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes <= 0) return '—';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    /** Read the stored image, tolerating a browser that denies storage. */
    function loadStored() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed.dataUrl !== 'string') return null;
        return {
          dataUrl: parsed.dataUrl,
          width: Number(parsed.width) || 0,
          height: Number(parsed.height) || 0,
          bytes: Number(parsed.bytes) || 0,
          name: typeof parsed.name === 'string' ? parsed.name : '',
        };
      } catch {
        return null;
      }
    }

    /** Persist the image; returns false when the browser refused it. */
    function saveStored(image) {
      try {
        if (image === null) window.localStorage.removeItem(STORAGE_KEY);
        else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(image));
        return true;
      } catch {
        return false;
      }
    }

    /** Download a generated 1280x640 starter artwork. */
    function downloadTemplate(tr) {
      const canvas = document.createElement('canvas');
      canvas.width = BEST_WIDTH;
      canvas.height = BEST_HEIGHT;
      const g = canvas.getContext('2d');
      if (!g) return;
      const gradient = g.createLinearGradient(0, 0, BEST_WIDTH, BEST_HEIGHT);
      gradient.addColorStop(0, '#101828');
      gradient.addColorStop(1, '#1d2939');
      g.fillStyle = gradient;
      g.fillRect(0, 0, BEST_WIDTH, BEST_HEIGHT);
      g.fillStyle = '#4f8cff';
      g.fillRect(72, 96, 8, 128);
      g.textBaseline = 'top';
      g.fillStyle = '#ffffff';
      g.font = '600 64px system-ui, -apple-system, "Segoe UI", sans-serif';
      g.fillText(tr('templateTitle'), 112, 96, BEST_WIDTH - 200);
      g.fillStyle = 'rgba(255,255,255,0.72)';
      g.font = '400 30px system-ui, -apple-system, "Segoe UI", sans-serif';
      g.fillText(tr('templateSubtitle'), 112, 190, BEST_WIDTH - 220);
      g.fillStyle = 'rgba(255,255,255,0.42)';
      g.font = '400 24px system-ui, -apple-system, "Segoe UI", sans-serif';
      g.fillText(BEST_WIDTH + ' × ' + BEST_HEIGHT, 112, BEST_HEIGHT - 96);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'social-preview-template.png';
      link.rel = 'noopener';
      link.click();
    }

    /** The Settings page. */
    function SocialPreview(props) {
      const tr = typeof props.t === 'function' ? props.t : (key) => key;
      const [image, setImage] = React.useState(null);
      const [error, setError] = React.useState(null);
      const [busy, setBusy] = React.useState(false);
      const [dragging, setDragging] = React.useState(false);
      const inputRef = React.useRef(null);

      React.useEffect(() => {
        setImage(loadStored());
      }, []);

      const accept = React.useCallback(
        async (file) => {
          if (!file) return;
          if (!ACCEPTED_MIME.test(file.type)) {
            setError(tr('errorType'));
            return;
          }
          setBusy(true);
          setError(null);
          try {
            const dataUrl = await readAsDataUrl(file);
            const size = await measure(dataUrl);
            const next = {
              dataUrl,
              width: size.width,
              height: size.height,
              bytes: file.size,
              name: file.name,
            };
            setImage(next);
            if (!saveStored(next)) setError(tr('errorStorage'));
            else if (size.width < MIN_WIDTH || size.height < MIN_HEIGHT) {
              setError(tr('tooSmall', { w: size.width, h: size.height }));
            }
          } catch {
            setError(tr('errorRead'));
          } finally {
            setBusy(false);
          }
        },
        [tr],
      );

      const openPicker = React.useCallback(() => {
        const input = inputRef.current;
        if (input) input.click();
      }, []);

      const remove = React.useCallback(() => {
        setImage(null);
        setError(null);
        saveStored(null);
      }, []);

      const onDrop = React.useCallback(
        (event) => {
          event.preventDefault();
          setDragging(false);
          const files = event.dataTransfer && event.dataTransfer.files;
          if (files && files.length > 0) accept(files[0]);
        },
        [accept],
      );

      const onKeyDown = React.useCallback(
        (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openPicker();
          }
        },
        [openPicker],
      );

      let status = null;
      if (image) {
        if (image.width >= BEST_WIDTH && image.height >= BEST_HEIGHT) {
          status = h('span', { className: 'spBadge spBadgeOk' }, tr('ok'));
        } else if (image.width >= MIN_WIDTH && image.height >= MIN_HEIGHT) {
          status = h('span', { className: 'spBadge spBadgeWarn' }, tr('warn'));
        } else {
          status = h('span', { className: 'spBadge spBadgeBad' }, tr('tooSmallBadge'));
        }
      }

      const card = h(
        'div',
        { className: 'spCard' },
        image
          ? h('img', { className: 'spCardImg', src: image.dataUrl, alt: tr('preview') })
          : h(
              'div',
              { className: 'spEmpty' },
              h('div', { className: 'spEmptyTitle' }, tr('dropTitle')),
              h('div', { className: 'spEmptyHint' }, tr('dropHint')),
            ),
      );

      return h(
        'div',
        { className: 'spSection' },
        h('h2', { className: 'spHeading' }, tr('title')),
        h('p', { className: 'spIntro' }, tr('intro')),
        h(
          'div',
          {
            className: 'spDrop' + (dragging ? ' spDropOver' : ''),
            role: 'button',
            tabIndex: 0,
            'aria-label': image ? tr('replace') : tr('upload'),
            'aria-busy': busy ? 'true' : undefined,
            onClick: openPicker,
            onKeyDown,
            onDragOver: (event) => {
              event.preventDefault();
              setDragging(true);
            },
            onDragLeave: () => setDragging(false),
            onDrop,
          },
          h('span', { className: 'spLabel' }, tr('preview')),
          card,
        ),
        h(
          'div',
          { className: 'spMeta' },
          h(
            'span',
            { className: 'spDims' },
            image
              ? tr('dims', {
                  w: image.width,
                  h: image.height,
                  size: formatBytes(image.bytes),
                })
              : tr('empty'),
          ),
          status,
        ),
        error ? h('p', { className: 'spError', role: 'alert' }, error) : null,
        h(
          'div',
          { className: 'spActions' },
          h(
            'button',
            {
              type: 'button',
              className: 'spBtn spBtnPrimary',
              disabled: busy,
              onClick: openPicker,
            },
            image ? tr('replace') : tr('upload'),
          ),
          image
            ? h(
                'button',
                { type: 'button', className: 'spBtn spBtnDanger', onClick: remove },
                tr('remove'),
              )
            : null,
          h(
            'button',
            {
              type: 'button',
              className: 'spBtn spBtnGhost',
              onClick: () => downloadTemplate(tr),
            },
            tr('download'),
          ),
          h('input', {
            ref: inputRef,
            type: 'file',
            accept: 'image/png,image/jpeg,image/webp',
            className: 'spVisuallyHidden',
            tabIndex: -1,
            'aria-hidden': 'true',
            onChange: (event) => {
              const file = event.target.files && event.target.files[0];
              event.target.value = '';
              if (file) accept(file);
            },
          }),
        ),
      );
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        const t = ctx.locale.bind(NS);
        ctx.effect(
          () => ctx.locale.register(NS, { zh: ZH, en: EN }),
          'social-preview: dictionaries',
        );
        ctx.effect(() => {
          if (typeof document === 'undefined') return () => {};
          const tag = document.createElement('style');
          tag.dataset.plugin = 'dsh-plugin-social-preview';
          tag.textContent = CSS;
          document.head.appendChild(tag);
          return () => {
            tag.remove();
          };
        }, 'social-preview: stylesheet');
        ctx.slots.inject('settings.section', () =>
          ctx.slots.register(
            {
              name: 'settings.section',
              id: 'social-preview',
              order: 25,
              label: () => t('nav'),
              locale: NS,
            },
            SocialPreview,
          ),
        );
      },
    };
  },
});
