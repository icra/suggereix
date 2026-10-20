<template>
  <div
    class="translation-toolbar notranslate"
    translate="no"
    aria-label="Selecció d'idioma"
  >
    <button
      type="button"
      class="language-button"
      :class="{ active: activeLanguage === 'ca' }"
      title="Català"
      aria-label="Canviar l'idioma a català"
      @click="setLanguage('ca')"
    >
      <svg class="language-flag" viewBox="0 0 27 18" aria-hidden="true">
        <rect width="27" height="18" fill="#f9d616" />
        <path
          d="M0 3H27 M0 7H27 M0 11H27 M0 15H27"
          stroke="#da121a"
          stroke-width="2"
        />
      </svg>
    </button>

    <button
      type="button"
      class="language-button"
      :class="{ active: activeLanguage === 'es' }"
      title="Castellà"
      aria-label="Canviar l'idioma a castellà"
      @click="setLanguage('es')"
    >
      <svg class="language-flag" viewBox="0 0 27 18" aria-hidden="true">
        <rect width="27" height="18" fill="#aa151b" />
        <rect y="4.5" width="27" height="9" fill="#f1bf00" />
      </svg>
    </button>

    <button
      type="button"
      class="language-button"
      :class="{ active: activeLanguage === 'en' }"
      title="English"
      aria-label="Change language to English"
      @click="setLanguage('en')"
    >
      <svg class="language-flag" viewBox="0 0 27 18" aria-hidden="true">
        <rect width="27" height="18" fill="#012169" />

        <path
          d="M0 0L27 18 M27 0L0 18"
          stroke="#ffffff"
          stroke-width="5"
        />
        <path
          d="M0 0L27 18 M27 0L0 18"
          stroke="#c8102e"
          stroke-width="2"
        />

        <path
          d="M13.5 0V18 M0 9H27"
          stroke="#ffffff"
          stroke-width="6"
        />
        <path
          d="M13.5 0V18 M0 9H27"
          stroke="#c8102e"
          stroke-width="3"
        />
      </svg>
    </button>

    <!-- Google s'inicialitza aquí, però el seu selector no es mostra -->
    <div id="google_translate_element"></div>

    <span v-if="loadError" class="translation-error">
      No s'ha pogut carregar la traducció.
    </span>
  </div>
</template>

<script>
const CALLBACK_NAME = 'suggereixGoogleTranslateInit'
const SCRIPT_ID = 'suggereix-google-translate-script'

export default {
  name: 'AutoTranslate',

  data() {
    return {
      activeLanguage: 'ca',
      loadError: false,
      originalTitle: '',
      titleObserver: null
    }
  },

  mounted() {
    this.activeLanguage = this.getCurrentLanguage()
    this.protectPageTitle()

    if (window.google && window.google.translate) {
      this.initializeTranslator()
      return
    }

    window[CALLBACK_NAME] = this.initializeTranslator

    if (document.getElementById(SCRIPT_ID)) {
      return
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src =
      `https://translate.google.com/translate_a/element.js?cb=${CALLBACK_NAME}`
    script.async = true
    script.onerror = () => {
      this.loadError = true
    }

    document.head.appendChild(script)
  },

  beforeDestroy() {
    if (this.titleObserver) {
      this.titleObserver.disconnect()
    }

    delete window[CALLBACK_NAME]
  },

  methods: {
    initializeTranslator() {
      if (!window.google || !window.google.translate) {
        this.loadError = true
        return
      }

      const container = document.getElementById(
        'google_translate_element'
      )

      if (!container || container.childNodes.length) {
        return
      }

      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'ca',
          includedLanguages: 'ca,es,en',
          autoDisplay: false
        },
        'google_translate_element'
      )
    },

    getCurrentLanguage() {
      const match = document.cookie.match(
        /(?:^|;\s*)googtrans=\/ca\/(ca|es|en)/
      )

      return match ? match[1] : 'ca'
    },

    setLanguage(language) {
      if (language === this.activeLanguage) {
        return
      }

      this.clearTranslationCookie()

      if (language !== 'ca') {
        document.cookie =
          `googtrans=/ca/${language};path=/;SameSite=Lax`
      }

      window.location.reload()
    },

    clearTranslationCookie() {
      const expiration =
        'expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'

      document.cookie = `googtrans=;${expiration}`

      const hostname = window.location.hostname
      const domains = [hostname]

      const domainParts = hostname.split('.')

      if (domainParts.length > 2) {
        domains.push(`.${domainParts.slice(-2).join('.')}`)
      }

      domains.forEach(domain => {
        document.cookie =
          `googtrans=;${expiration};domain=${domain}`
      })
    },

    protectPageTitle() {
      this.originalTitle = document.title

      const titleElement = document.querySelector('title')

      if (!titleElement) {
        return
      }

      this.titleObserver = new MutationObserver(() => {
        if (document.title !== this.originalTitle) {
          document.title = this.originalTitle
        }
      })

      this.titleObserver.observe(titleElement, {
        childList: true,
        subtree: true,
        characterData: true
      })
    }
  }
}
</script>

<style>
.translation-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.35rem;
  margin: 0 0 0.75rem;
}

.language-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 32px;
  padding: 4px;
  background: #ffffff;
  border: 1px solid #b8c5d6;
  border-radius: 4px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    transform 0.15s ease;
}

.language-button:hover {
  background: #eef4fb;
  border-color: #17245c;
  transform: translateY(-1px);
}

.language-button.active {
  background: #e3edf8;
  border: 2px solid #17245c;
}

.language-button:focus-visible {
  outline: 2px solid #2673bd;
  outline-offset: 2px;
}

.language-flag {
  display: block;
  width: 27px;
  height: 18px;
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.5);
}

/* El selector original continua existint, però queda fora de la pantalla */
#google_translate_element {
  position: absolute !important;
  left: -10000px !important;
  width: 1px !important;
  height: 1px !important;
  overflow: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

/* Barra superior injectada per Google */
.goog-te-banner-frame,
.goog-te-banner-frame.skiptranslate,
iframe.goog-te-banner-frame,
.VIpgJd-ZVi9od-ORHb-OEVmcd {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
}

html,
body {
  top: 0 !important;
  margin-top: 0 !important;
}

/* Finestra emergent amb el text original */
#goog-gt-tt,
.goog-te-balloon-frame,
.VIpgJd-yAWNEb-L7lbkb,
.VIpgJd-yAWNEb-hvhgNd {
  display: none !important;
  visibility: hidden !important;
}

/* Evita el ressaltat dels textos traduïts */
.goog-text-highlight {
  background: transparent !important;
  box-shadow: none !important;
}

.translation-error {
  color: #a12222;
  font-size: 0.85rem;
}

@media (max-width: 600px) {
  .translation-toolbar {
    justify-content: center;
  }
}
/* Elimina el ressaltat en passar el cursor pels textos traduïts */
.goog-text-highlight,
.VIpgJd-yAWNEb-VIpgJd-fmcmS-sn54Q {
  background-color: transparent !important;
  box-shadow: none !important;
  outline: none !important;
}/* Oculta el logotip/indicador de càrrega de Google Translate */
.VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
.VIpgJd-ZVi9od-aZ2wEe-OiiCO,
.VIpgJd-ZVi9od-aZ2wEe,
.goog-te-spinner-pos,
.goog-te-spinner-animation {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

</style>