import { useState, useEffect } from 'react';
import './OutreachContract.css';

interface OutreachContractProps {
  onNavigate?: (page: 'demo-setup' | 'recipe1' | 'recipe-loader' | 'recipe2' | 'chat' | 'outreach-contract') => void;
}

interface CandidateEmail {
  name: string;
  role: string;
  company: string;
  emailBody: string;
  emailSubject?: string;
}

// Hardcoded email content for Carol-anne
const CAROL_ANNE_HARDCODED_EMAIL = {
  subject: "Checking in on your next move, Carol-Anne",
  body: `Hi Carol-Anne,<br><br>I saw that your new paper on rare disease management was published last week — congratulations on the launch! The insights you shared on patient pathways and integrated care models really reinforce the depth of your expertise in the field.<br><br>Given your track record of impact at Amgen and your continued thought leadership, I'm curious — are you looking to expand further into advisory or consulting roles, or does the specialty account leadership path still excite you most?<br><br>I thought these might resonate with you:<br><br><div style="margin-bottom: 24px;"> <img src="/Natera%20Blog.webp" alt="Natera to Report Third Quarter Results on November 6, 2025" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; margin-bottom: 12px;"> <a href="https://www.natera.com/investor-relations/" style="font-size: 16px; font-weight: 600; color: #2563eb; text-decoration: none;">Natera to Report Third Quarter Results on November 6, 2025</a> <p style="margin-top: 8px; font-size: 14px; color: #6b7280; line-height: 1.6;">With your focus on strategic sales and evidence-driven healthcare, this update offers an interesting view into how Natera is framing growth in the precision medicine space.</p> </div> <div style="margin-bottom: 24px;"> <img src="/Natera%20Blog.webp" alt="Natera Named to Fast Company's Next Big Things in Tech List" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; margin-bottom: 12px;"> <a href="https://www.fastcompany.com/next-big-things-in-tech" style="font-size: 16px; font-weight: 600; color: #2563eb; text-decoration: none;">Natera Named to Fast Company's Next Big Things in Tech List</a> <p style="margin-top: 8px; font-size: 14px; color: #6b7280; line-height: 1.6;">A look at Natera's recognition for innovation — a natural complement to your own work advancing technology-enabled healthcare solutions.</p> </div> <div style="margin-bottom: 24px;"> <img src="/Natera%20Blog.webp" alt="How Technology is Transforming Rare Disease Care" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; margin-bottom: 12px;"> <a href="https://www.healthaffairs.org/do/10.1377/hblog20240509.12345" style="font-size: 16px; font-weight: 600; color: #2563eb; text-decoration: none;">How Technology is Transforming Rare Disease Care</a> <p style="margin-top: 8px; font-size: 14px; color: #6b7280; line-height: 1.6;">An exploration of digital innovation in rare disease management — closely aligned with the themes in your recent paper.</p> </div>Happy to chat if you're thinking about next steps or just want to swap perspectives on the evolving rare disease landscape.<br><br>Best,`
};

const OutreachContract: React.FC<OutreachContractProps> = ({ onNavigate }) => {
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
  const [candidates, setCandidates] = useState<CandidateEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    loadEmailData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.querySelector('.main-content');
      if (scrollContainer) {
        setIsScrolled(scrollContainer.scrollTop > 0);
      }
    };

    const scrollContainer = document.querySelector('.main-content');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const loadEmailData = () => {
    try {
      const preGeneratedData = localStorage.getItem('preGeneratedEmailData');

      if (preGeneratedData) {
        const parsedData = JSON.parse(preGeneratedData);
        console.log('OutreachContract - Loaded pre-generated data:', parsedData);

        const loadedCandidates: CandidateEmail[] = [];

        // Check if we have role-specific email data
        if (parsedData.roleEmails) {
          // Load Breanna Achenbach
          if (parsedData.roleEmails.breannaAchenbach && parsedData.roleEmails.breannaAchenbach.email) {
            const breannaData = parsedData.roleEmails.breannaAchenbach;
            loadedCandidates.push({
              name: breannaData.candidate?.name || "Breanna Achenbach",
              role: breannaData.candidate?.current_title || "Phlebotomist",
              company: breannaData.candidate?.company || "Quest Diagnostics",
              emailBody: breannaData.email.body || '',
              emailSubject: breannaData.email.subject || ''
            });
          }

          // Load Ozgur Acar
          if (parsedData.roleEmails.ozgurAcar && parsedData.roleEmails.ozgurAcar.email) {
            const ozgurData = parsedData.roleEmails.ozgurAcar;
            loadedCandidates.push({
              name: ozgurData.candidate?.name || "Ozgur Acar",
              role: ozgurData.candidate?.current_title || "Registered Nurse",
              company: ozgurData.candidate?.company || "Stanford Health Care",
              emailBody: ozgurData.email.body || '',
              emailSubject: ozgurData.email.subject || ''
            });
          }

          // Load Carol-anne Weeks - Always use hardcoded content
          loadedCandidates.push({
            name: "Carol-anne",
            role: "Healthcare Specialist",
            company: "Amgen",
            emailBody: CAROL_ANNE_HARDCODED_EMAIL.body,
            emailSubject: CAROL_ANNE_HARDCODED_EMAIL.subject
          });
        }

        // If we successfully loaded candidates, use them
        if (loadedCandidates.length > 0) {
          setCandidates(loadedCandidates);
          console.log('OutreachContract - Loaded candidates from API:', loadedCandidates);
        } else {
          // Fallback to default candidates if API data not available
          console.log('OutreachContract - No API data found, using fallback');
          setCandidates(getDefaultCandidates());
        }
      } else {
        // No pre-generated data, use defaults
        console.log('OutreachContract - No pre-generated data, using defaults');
        setCandidates(getDefaultCandidates());
      }
    } catch (error) {
      console.error('OutreachContract - Error loading email data:', error);
      setCandidates(getDefaultCandidates());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultCandidates = (): CandidateEmail[] => {
    return [
      {
        name: "Breanna Achenbach",
        role: "Phlebotomist",
        company: "Quest Diagnostics",
        emailBody: `Hi Breanna,

I came across your profile and was impressed by your experience in phlebotomy and patient care. Your dedication to providing excellent healthcare services really stood out.

We're currently looking for talented healthcare professionals who have deep expertise in clinical laboratory services. Given your background and hands-on experience, I thought you might be interested in some of the opportunities we have at Natera.

I'd love to connect and share more about what we're working on. Would you be open to a brief conversation?`
      }
    ];
  };

  const formatEmailBody = (body: string): string => {
    // Format email body similar to EmailPreview component
    return body
      .replace(/\n\n/g, '</p><p>')  // Convert double newlines to paragraph breaks
      .replace(/\n/g, '<br>')        // Convert single newlines to line breaks
      .replace(/^/, '<p>')           // Add opening paragraph tag at start
      .replace(/$/, '</p>')          // Add closing paragraph tag at end
      // Convert markdown-style links [text](url) to HTML links
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" style="color: #4599FA; text-decoration: underline;">$1</a>')
      // Convert bare URLs to clickable links
      .replace(/(^|[^"])(https?:\/\/[^\s<]+)(?![^<]*<\/a>)/g, '$1<a href="$2" target="_blank" style="color: #4599FA; text-decoration: underline;">$2</a>');
  };

  const currentCandidate = candidates[currentCandidateIndex] || getDefaultCandidates()[0];
  const formattedEmailBody = formatEmailBody(currentCandidate.emailBody);

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (candidates.length === 0) return;

    if (direction === 'next') {
      setCurrentCandidateIndex((prev) => (prev + 1) % candidates.length);
    } else {
      setCurrentCandidateIndex((prev) => (prev - 1 + candidates.length) % candidates.length);
    }
  };

  const handleChatClick = () => {
    // Parse first name from full name
    const fullName = currentCandidate?.name || 'Unknown';
    const firstName = fullName.split(' ')[0];

    // Get the current role key based on candidate index
    const roleKeys = ['breannaAchenbach', 'ozgurAcar', 'carolAnneWeeks'];
    const currentRoleKey = roleKeys[currentCandidateIndex];

    // Get interests and job preferences from the stored email data (from Natera API)
    let professionalInterests = [
      'career development topics',
      'back-end software engineering',
      'cloud computing',
      'new java releases'
    ]; // fallback

    let jobPreferences = {
      titles: ['Software Engineer'],
      locations: ['Austin, TX', 'Remote'],
      levelSeniority: 'Senior',
      jobSpecifics: [],
      company: 'Natera'
    }; // fallback

    try {
      const preGeneratedData = localStorage.getItem('preGeneratedEmailData');
      if (preGeneratedData) {
        const parsedData = JSON.parse(preGeneratedData);

        // Try to get data from role-specific data for the current role
        if (parsedData.roleEmails && currentRoleKey && parsedData.roleEmails[currentRoleKey]) {
          const roleData = parsedData.roleEmails[currentRoleKey];

          // Parse interests
          if (roleData.interests) {
            const interestsText = roleData.interests;
            console.log(`Getting interests for role ${currentRoleKey}:`, interestsText);

            // Parse the interests text (format: "• Interest 1\n• Interest 2\n...")
            const interestLines = interestsText.split('\n')
              .filter((line: string) => line.trim().startsWith('•'))
              .map((line: string) => line.replace('•', '').trim())
              .filter((line: string) => line.length > 0);

            if (interestLines.length > 0) {
              professionalInterests = interestLines;
              console.log(`Using API interests for ${fullName} in chat:`, professionalInterests);
            }
          }

          // Parse job preferences
          if (roleData.job_preferences) {
            const jobPrefText = roleData.job_preferences;
            console.log(`Getting job preferences for role ${currentRoleKey}:`, jobPrefText);

            const lines = jobPrefText.split('\n');
            const parsedJobPrefs = { ...jobPreferences };

            lines.forEach((line: string) => {
              const trimmed = line.trim();
              if (trimmed.startsWith('Job Titles:')) {
                const titlesText = trimmed.replace('Job Titles:', '').trim();
                const titles = titlesText.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
                if (titles.length > 0) {
                  parsedJobPrefs.titles = titles;
                }
              } else if (trimmed.startsWith('Location:')) {
                const locationText = trimmed.replace('Location:', '').trim();
                if (locationText.length > 0) {
                  parsedJobPrefs.locations = [locationText];
                }
              } else if (trimmed.startsWith('Seniority:')) {
                const seniorityText = trimmed.replace('Seniority:', '').trim();
                if (seniorityText.length > 0) {
                  parsedJobPrefs.levelSeniority = seniorityText;
                }
              }
            });

            jobPreferences = parsedJobPrefs;
            console.log(`Using API job preferences for ${fullName} in chat:`, jobPreferences);
          }
        }
      }
    } catch (error) {
      console.error('Error parsing data from API:', error);
    }

    // Store candidate information for the chat using data from Natera API
    const candidateData = {
      name: fullName,
      firstName: firstName,
      jobPreferences: jobPreferences,
      professionalInterests: professionalInterests,
      timestamp: Date.now()
    };

    console.log('Using dynamic candidate data:', candidateData);

    // Save candidate data to localStorage
    try {
      localStorage.setItem('candidateData', JSON.stringify(candidateData));
    } catch (error) {
      console.error('Error saving candidate data:', error);
    }

    // Navigate to Chat page
    onNavigate?.('chat');
  };

  if (loading) {
    return (
      <div className="outreach-contract">
        <div className="content-wrapper">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            color: '#666',
            fontSize: '16px'
          }}>
            Loading email preview...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="outreach-contract">
      <div className="content-wrapper">
        {/* Sticky Header Container */}
        <div className={`sticky-header ${isScrolled ? 'scrolled' : ''}`}>
          {/* Header */}
          <div className="title-section">
            <div className="title-with-logo">
              <img
                className="x-logo"
                src="/AI%20Loader.gif"
                alt="AI Logo"
              />
              <h1 className="page-title">
                All set! Ready for me to start nurturing?
              </h1>
            </div>
            <div className="header-buttons">
              <button className="header-btn-secondary">
                Request Changes
              </button>
              <button className="header-btn-primary">
                Activate Cleo
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="header-divider"></div>
        </div>

        {/* Two Column Layout */}
        <div className="two-column-layout">
          {/* Left Column - Email Preview */}
          <div className="left-column">
            <div className="email-preview-card">
              {/* Email Content */}
              <div className="email-content">
                {/* Hero Section */}
                <div className="hero-section">
                  <div className="hero-container">
                    <div className="hero-image-wrapper">
                      <img
                        src="/Natera%20Email%20image.png"
                        alt="Hero"
                        className="hero-image"
                      />
                      {/* Navigation Chip */}
                      <div className="hero-chip">
                        <button className="chip-arrow" onClick={() => handleNavigate('prev')}>
                          <span className="material-icons-round">chevron_left</span>
                        </button>
                        <span>{currentCandidate.name}: {currentCandidate.role}</span>
                        <button className="chip-arrow" onClick={() => handleNavigate('next')}>
                          <span className="material-icons-round">chevron_right</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Email Text */}
                  <div className="email-text-section">
                    <h2 className="email-heading">
                      {currentCandidate.emailSubject || `${currentCandidate.name.split(' ')[0]}, thought of you for this role`}
                    </h2>
                    <div
                      className="email-body-text"
                      dangerouslySetInnerHTML={{ __html: formattedEmailBody }}
                    />
                  </div>

                  {/* CTA Section */}
                  <div className="cta-section">
                    <div className="cta-divider"></div>
                    <p className="cta-text">
                      Not quite what you were looking for? Chat to Cleo to fine-tune what content and job opportunities we share with you!
                    </p>
                    <button className="cta-button" onClick={handleChatClick}>
                      <span className="material-icons-round">auto_awesome</span>
                      <span>Speak to Cleo</span>
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="email-footer">
                  <img src="/Natera logo.svg" alt="Natera Logo" className="footer-logo" />
                  <div className="footer-divider-line"></div>
                  <p className="footer-text">
                    This email was sent to you because you are subscribed to the career newsletter.
                  </p>
                  <div className="footer-copyright">
                    <p>© 2024 Logoipsum Inc. All rights reserved.</p>
                    <p>Redwood City, California, USA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contract Cards */}
          <div className="right-column">
            {/* Personal */}
            <div className="contract-card">
              <div className="contract-icon-wrapper">
                <span className="material-icons-round">auto_awesome</span>
              </div>
              <div className="contract-content">
                <p className="contract-title">Personal</p>
                <p className="contract-description">
                  Recognize career milestones and work anniversaries to create authentic, <strong>personal connections</strong>.
                </p>
              </div>
            </div>

            {/* Audience */}
            <div className="contract-card">
              <div className="contract-icon-wrapper">
                <span className="material-icons-round">sports_score</span>
              </div>
              <div className="contract-content">
                <p className="contract-title">Audience</p>
                <p className="contract-description">
                  Nurture your <strong>entire talent network</strong> to grow a long-term candidate pipeline.
                </p>
              </div>
            </div>

            {/* Cadence */}
            <div className="contract-card">
              <div className="contract-icon-wrapper">
                <span className="material-icons-round">email</span>
              </div>
              <div className="contract-content">
                <p className="contract-title">Cadence</p>
                <p className="contract-description">
                  Reach out at least every <strong>3 months</strong> with content from your blog and new openings in your ATS.
                </p>
              </div>
            </div>

            {/* Updates */}
            <div className="contract-card">
              <div className="contract-icon-wrapper">
                <span className="material-icons-round">schedule</span>
              </div>
              <div className="contract-content">
                <p className="contract-title">Updates</p>
                <p className="contract-description">
                  Get a <strong>weekly progress report every Monday</strong> with response rates and engagement highlights.
                </p>
              </div>
            </div>

            {/* Control */}
            <div className="contract-card">
              <div className="contract-icon-wrapper">
                <span className="material-icons-round">handshake</span>
              </div>
              <div className="contract-content">
                <p className="contract-title">Control</p>
                <p className="contract-description">
                  Respect your <strong>no-contact list</strong> and confirm changes with you before updating the approach.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutreachContract;
