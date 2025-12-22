import { useState, useRef, useEffect } from 'react'
import './App.css'
import aboutContent from './content/about.txt?raw'
import techContent from './content/tech.txt?raw'
import contactContent from './content/contact.txt?raw'

type SectionKey = 'about' | 'tech' | 'contact'
type AllSectionKey = SectionKey | string

interface Section {
  title: string
  content: string
}

interface EphemeralTab {
  id: string
  title: string
  content: string
}

interface SocialLink {
  name: string
  url: string
  icon: React.ReactNode
}

function App() {
  const [activeSection, setActiveSection] = useState<AllSectionKey>('about')
  const [ephemeralTabs, setEphemeralTabs] = useState<EphemeralTab[]>([])
  const [isCreatingTab, setIsCreatingTab] = useState(false)
  const [newTabName, setNewTabName] = useState('')
  const contentRef = useRef<HTMLPreElement>(null)
  const newTabInputRef = useRef<HTMLInputElement>(null)
  const tabsLeftRef = useRef<HTMLDivElement>(null)

  const sections: Record<SectionKey, Section> = {
    about: {
      title: 'about',
      content: aboutContent
    },
    tech: {
      title: 'tech',
      content: techContent
    },
    contact: {
      title: 'contact',
      content: contactContent
    }
  }

  // Réinitialiser le contenu quand on change de section ou qu'on perd le focus
  useEffect(() => {
    if (contentRef.current) {
      const currentContent = getCurrentContent()
      contentRef.current.textContent = currentContent
    }
  }, [activeSection, ephemeralTabs])

  // Focus sur l'input quand on crée un nouvel onglet
  useEffect(() => {
    if (isCreatingTab && newTabInputRef.current) {
      newTabInputRef.current.focus()
    }
  }, [isCreatingTab])

  // Gestion du Ctrl+S pour sauvegarder le contenu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveCurrentTab()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeSection, ephemeralTabs, sections])

  const getCurrentContent = (): string => {
    const sectionKeys: SectionKey[] = ['about', 'tech', 'contact']
    if (sectionKeys.includes(activeSection as SectionKey)) {
      return sections[activeSection as SectionKey].content
    }
    const ephemeralTab = ephemeralTabs.find(tab => tab.id === activeSection)
    return ephemeralTab?.content || ''
  }

  const getCurrentTabTitle = (): string => {
    const sectionKeys: SectionKey[] = ['about', 'tech', 'contact']
    if (sectionKeys.includes(activeSection as SectionKey)) {
      return sections[activeSection as SectionKey].title
    }
    const ephemeralTab = ephemeralTabs.find(tab => tab.id === activeSection)
    return ephemeralTab?.title || 'untitled'
  }

  const saveCurrentTab = () => {
    const content = contentRef.current?.textContent || getCurrentContent()
    const title = getCurrentTabTitle()
    
    // Créer un blob avec le contenu
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    
    // Créer un lien de téléchargement
    const link = document.createElement('a')
    link.href = url
    link.download = `${title}.txt`
    document.body.appendChild(link)
    link.click()
    
    // Nettoyer
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleBlur = () => {
    if (contentRef.current) {
      const sectionKeys: SectionKey[] = ['about', 'tech', 'contact']
      // Pour les onglets permanents, réinitialiser le contenu
      if (sectionKeys.includes(activeSection as SectionKey)) {
        const currentContent = getCurrentContent()
        contentRef.current.textContent = currentContent
      } else {
        // Pour les onglets éphémères, sauvegarder temporairement le contenu
        const updatedContent = contentRef.current.textContent || ''
        setEphemeralTabs(prevTabs =>
          prevTabs.map(tab =>
            tab.id === activeSection ? { ...tab, content: updatedContent } : tab
          )
        )
      }
    }
  }

  const handleInput = () => {
    // Permet l'édition visuelle
    // Pour les onglets permanents, le contenu sera réinitialisé au blur
    // Pour les onglets éphémères, le contenu sera sauvegardé temporairement
  }

  const createNewTab = () => {
    if (newTabName.trim()) {
      const newTab: EphemeralTab = {
        id: `ephemeral-${Date.now()}`,
        title: newTabName.trim(),
        content: ''
      }
      setEphemeralTabs([...ephemeralTabs, newTab])
      setActiveSection(newTab.id)
      setNewTabName('')
      setIsCreatingTab(false)
    }
  }

  const deleteEphemeralTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newTabs = ephemeralTabs.filter(tab => tab.id !== tabId)
    setEphemeralTabs(newTabs)
    if (activeSection === tabId && newTabs.length > 0) {
      setActiveSection(newTabs[0].id)
    } else if (activeSection === tabId) {
      setActiveSection('about')
    }
  }

  const handleNewTabKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      createNewTab()
    } else if (e.key === 'Escape') {
      setIsCreatingTab(false)
      setNewTabName('')
    }
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (tabsLeftRef.current) {
      e.preventDefault()
      tabsLeftRef.current.scrollLeft += e.deltaY
    }
  }

  const socialLinks: SocialLink[] = [
    {
      name: 'Discord',
      url: 'https://discord.com/users/171356978310938624',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      )
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/kisakaylpb',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/mauve.framboise',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      )
    },
    {
      name: 'GitHub',
      url: 'https://github.com/Kisakay',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      )
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com/@Kisakay',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    },
    {
      name: 'Twitch',
      url: 'https://twitch.tv/anaissaraiva',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
        </svg>
      )
    },
    {
      name: 'Reddit',
      url: 'https://reddit.com/user/TouchHot8779',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      )
    },
    {
      name: 'GitLab',
      url: 'https://gitlab.com/Kisakay',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.423-.73-.423-.867 0L16.418 9.45H7.582L4.919 1.263C4.783.84 4.185.84 4.05 1.26L1.386 9.452.044 13.587c-.121.375.014.789.331 1.023L12 23.054l11.625-8.443c.318-.235.453-.647.33-1.024" />
        </svg>
      )
    },
    {
      name: 'Email',
      url: 'mailto:anais.saraiva@ihorizon.org',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 9.00005L10.2 13.65C11.2667 14.45 12.7333 14.45 13.8 13.65L20 9" />
          <path d="M3 9.17681C3 8.45047 3.39378 7.78123 4.02871 7.42849L11.0287 3.5396C11.6328 3.20402 12.3672 3.20402 12.9713 3.5396L19.9713 7.42849C20.6062 7.78123 21 8.45047 21 9.17681V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V9.17681Z" />
        </svg>
      )
    },
    {
      name: 'iHorizon',
      url: 'https://ihorizon.org',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="4" width="14" height="8" rx="2" />
          <rect x="5" y="14" width="14" height="6" rx="2" />
          <circle cx="9" cy="8" r="1" fill="currentColor" />
          <circle cx="15" cy="8" r="1" fill="currentColor" />
          <line x1="9" y1="12" x2="15" y2="12" />
          <line x1="7" y1="17" x2="7" y2="20" />
          <line x1="17" y1="17" x2="17" y2="20" />
        </svg>
      )
    },
    {
      name: 'KXS',
      url: 'https://kxs.rip',
      icon: (
        <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
          <g opacity="0.2">
            <path d="M149,159.832l23.01835-.09217a52.04589,52.04589,0,0,0,51.21853-61.03119l-.00853.00148,16.351,84.42309A28.00192,28.00192,0,0,1,192.204,207.796l.00166-.00173L149,159.832Z" />
          </g>
          <g>
            <path d="M192,108a8.00008,8.00008,0,0,0-8-8H152a8,8,0,0,0,0,16h32A8.00008,8.00008,0,0,0,192,108Z" />
            <path d="M104,100H96V92a8,8,0,0,0-16,0v8H72a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0v-8h8a8,8,0,0,0,0-16Z" />
            <path d="M247.45752,181.74316c-.00781-.04394-.01611-.08789-.02441-.13183L231.08252,97.18848c-.01227-.06348-.03217-.123-.04584-.18555a60.08632,60.08632,0,0,0-59.01861-49.2627h-.02344L84.00439,48A59.86832,59.86832,0,0,0,24.90625,97.58887c-.0127.07226-.02441.14551-.03516.21777L8.57715,181.60547c-.00879.0459-.01709.0918-.02539.13769A36.00238,36.00238,0,0,0,69.45752,213.457q.21753-.2168.416-.44726l40.729-45.02442,34.84961-.13916,40.67139,45.14893q.20361.2373.42822.46191a36.00125,36.00125,0,0,0,60.90576-31.71387ZM107.00684,152a7.99986,7.99986,0,0,0-5.90039,2.63281L57.99219,202.293a20.00156,20.00156,0,0,1-33.69483-17.707l16.3501-84.08789q.04688-.24464.0791-.48633A43.90321,43.90321,0,0,1,84.02783,64l87.99756-.25977a44,44,0,1,1-.03955,88Zm108.4707,55.69141a20.03414,20.03414,0,0,1-17.45606-5.39453l-31.11169-34.53614,5.10828-.02051a60.00525,60.00525,0,0,0,50.94067-28.34961l8.75269,45.19239A20.02155,20.02155,0,0,1,215.47754,207.69141Z" />
          </g>
        </svg>
      )
    },
    {
      name: 'Last.fm',
      url: 'https://last.fm/user/kisakay',
      icon: (
        <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
          <path d="M 14.347656 22.078125 L 13.320313 19.289063 C 13.320313 19.289063 11.652344 21.148438 9.152344 21.148438 C 6.941406 21.148438 5.367188 19.222656 5.367188 16.144531 C 5.367188 12.199219 7.355469 10.789063 9.3125 10.789063 C 12.136719 10.789063 13.03125 12.617188 13.804688 14.957031 L 14.828125 18.164063 C 15.855469 21.277344 17.78125 23.777344 23.328125 23.777344 C 27.304688 23.777344 30 22.558594 30 19.351563 C 30 16.753906 28.523438 15.40625 25.765625 14.765625 L 23.710938 14.316406 C 22.300781 13.996094 21.882813 13.417969 21.882813 12.457031 C 21.882813 11.367188 22.75 10.722656 24.160156 10.722656 C 25.699219 10.722656 26.535156 11.300781 26.664063 12.679688 L 29.871094 12.296875 C 29.613281 9.410156 27.625 8.222656 24.351563 8.222656 C 21.46875 8.222656 18.644531 9.3125 18.644531 12.808594 C 18.644531 14.988281 19.703125 16.367188 22.363281 17.011719 L 24.546875 17.523438 C 26.179688 17.910156 26.726563 18.582031 26.726563 19.511719 C 26.726563 20.699219 25.570313 21.179688 23.390625 21.179688 C 20.152344 21.179688 18.804688 19.480469 18.035156 17.140625 L 16.976563 13.933594 C 15.628906 9.761719 13.480469 8.222656 9.214844 8.222656 C 4.503906 8.222656 2 11.203125 2 16.273438 C 2 21.148438 4.503906 23.777344 8.992188 23.777344 C 12.617188 23.777344 14.347656 22.078125 14.347656 22.078125 Z" />
        </svg>
      )
    },
  ]

  return (
    <div className="container">
      <nav className="tabs">
        <div 
          ref={tabsLeftRef}
          className="tabs-left"
          onWheel={handleWheel}
        >
          {Object.keys(sections).map((key) => (
            <button
              key={key}
              className={`tab ${activeSection === key ? 'active' : ''}`}
              onClick={() => setActiveSection(key as SectionKey)}
            >
              {sections[key as SectionKey].title}
            </button>
          ))}
          {ephemeralTabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab ephemeral ${activeSection === tab.id ? 'active' : ''}`}
              onClick={() => setActiveSection(tab.id)}
            >
              {tab.title}
              <span
                className="tab-close"
                onClick={(e) => deleteEphemeralTab(tab.id, e)}
                title="Delete tab"
              >
                ×
              </span>
            </button>
          ))}
          {isCreatingTab ? (
            <input
              ref={newTabInputRef}
              type="text"
              className="tab-input"
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
              onBlur={() => {
                if (newTabName.trim()) {
                  createNewTab()
                } else {
                  setIsCreatingTab(false)
                }
              }}
              onKeyDown={handleNewTabKeyDown}
              placeholder="tab name"
            />
          ) : (
            <button
              className="tab tab-new"
              onClick={() => setIsCreatingTab(true)}
              title="Create new tab"
            >
              +
            </button>
          )}
        </div>
        <div className="social-links">
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              title={social.name}
            >
              {social.icon}
            </a>
          ))}
        </div>
      </nav>

      <main className="editor">
        <pre
          ref={contentRef}
          className="content"
          contentEditable
          suppressContentEditableWarning
          onBlur={handleBlur}
          onInput={handleInput}
        >
          {getCurrentContent()}
        </pre>
      </main>
    </div>
  )
}

export default App

