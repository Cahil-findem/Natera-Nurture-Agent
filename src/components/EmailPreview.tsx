import { useState, useEffect } from 'react';
import './EmailPreview.css';

interface EmailData {
  subject: string;
  content: string;
  preview_text: string;
  logoUrl?: string;
  companyName?: string;
  companyWebsite?: string;
  role?: string;
}

interface RoleEmailData {
  breannaAchenbach: EmailData | null;
  ozgurAcar: EmailData | null;
  carolAnneWeeks: EmailData | null;
}

interface EmailPreviewProps {
  onChatClick?: (candidateInfo: any, currentRole?: string) => void;
}

const EmailPreview: React.FC<EmailPreviewProps> = ({ onChatClick }) => {
  const [emailData, setEmailData] = useState<RoleEmailData>({
    breannaAchenbach: null,
    ozgurAcar: null,
    carolAnneWeeks: null
  });
  const [currentRole, setCurrentRole] = useState<'breannaAchenbach' | 'ozgurAcar' | 'carolAnneWeeks'>('breannaAchenbach');
  const [loading, setLoading] = useState(true);
  const [candidateInfo, setCandidateInfo] = useState<any>(null);

  useEffect(() => {
    generateEmailContent();
  }, []);


  const generateEmailContent = async () => {
    try {
      // Debug: Log what's in localStorage to understand the structure
      const preGeneratedData = localStorage.getItem('preGeneratedEmailData');
      if (preGeneratedData) {
        const parsedData = JSON.parse(preGeneratedData);
        console.log('EmailPreview - LocalStorage data structure check:', {
          hasEmailData: !!parsedData.emailData,
          hasRoleEmails: !!parsedData.roleEmails,
          hasOldFormat: parsedData.emailData && !!parsedData.emailData.email,
          hasNewFormat: parsedData.roleEmails && (!!parsedData.roleEmails.breannaAchenbach || !!parsedData.roleEmails.ozgurAcar),
          emailDataKeys: parsedData.emailData ? Object.keys(parsedData.emailData) : [],
          roleEmailKeys: parsedData.roleEmails ? Object.keys(parsedData.roleEmails) : []
        });
        
        // Only clear if it's definitely the old format (has email directly but no new structure)
        if (parsedData.emailData && parsedData.emailData.email && 
            !parsedData.roleEmails &&
            !parsedData.candidates) { // Also check that we don't have the candidates object
          console.log('EmailPreview - Clearing confirmed old format data');
          localStorage.removeItem('preGeneratedEmailData');
        } else {
          console.log('EmailPreview - Data format is new or mixed, keeping data');
        }
      }
      
      // Check for pre-generated email data from RecipeLoader
      const freshPreGeneratedData = localStorage.getItem('preGeneratedEmailData');
      if (freshPreGeneratedData) {
        try {
          const parsedPreGenerated = JSON.parse(freshPreGeneratedData);
          console.log('EmailPreview - Using pre-generated email data from RecipeLoader:', parsedPreGenerated);
          console.log('EmailPreview - parsedPreGenerated.emailData structure:', Object.keys(parsedPreGenerated.emailData || {}));
          
          // Set candidate info (use primary candidate for backward compatibility)
          setCandidateInfo(parsedPreGenerated.candidate);
          
          const newEmailData: RoleEmailData = {
            breannaAchenbach: null,
            ozgurAcar: null,
            carolAnneWeeks: null
          };

          // Check if we have role-specific data (new format)
          console.log('EmailPreview - Checking for role-specific data:', parsedPreGenerated.emailData);
          
          // If this is primary-only data, we need to fetch the other candidates
          if (parsedPreGenerated.primaryOnly) {
            console.log('EmailPreview - Primary-only data detected, fetching other candidates...');

            // Use primary data for breannaAchenbach
            const formattedBody = parsedPreGenerated.emailData.email.body
              .replace(/\n\n/g, '</p><p>')
              .replace(/\n/g, '<br>')
              .replace(/^/, '<p>')
              .replace(/$/, '</p>')
              // Convert markdown-style links [text](url) to HTML links first
              .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" style="color: #4599FA; text-decoration: underline;">$1</a>')
              // Then convert any remaining bare URLs to clickable links
              .replace(/(^|[^"])(https?:\/\/[^\s<]+)(?![^<]*<\/a>)/g, '$1<a href="$2" target="_blank" style="color: #4599FA; text-decoration: underline;">$2</a>');

            newEmailData.breannaAchenbach = {
              subject: parsedPreGenerated.emailData.email.subject,
              content: formattedBody,
              preview_text: parsedPreGenerated.emailData.email.subject,
              logoUrl: '/Natera logo.svg',
              companyName: 'Natera',
              companyWebsite: 'https://www.natera.com',
              role: 'Breanna Achenbach - Phlebotomist'
            };

            // Set loading false - all data should be available from RecipeLoader
            setEmailData(newEmailData);
            setLoading(false);
            return;
          } else if (parsedPreGenerated.roleEmails && (parsedPreGenerated.roleEmails.breannaAchenbach || parsedPreGenerated.roleEmails.ozgurAcar || parsedPreGenerated.roleEmails.carolAnneWeeks)) {
            console.log('EmailPreview - Using role-specific pre-generated data');

            const roles = [
              { key: 'breannaAchenbach', name: 'Breanna Achenbach - Phlebotomist' },
              { key: 'ozgurAcar', name: 'Ozgur Acar - Registered Nurse' },
              { key: 'carolAnneWeeks', name: 'Carol-anne Weeks - Healthcare Specialist' }
            ];

            roles.forEach(role => {
              const roleData = parsedPreGenerated.roleEmails[role.key];
              if (roleData && roleData.email) {
                const formattedBody = roleData.email.body
                  .replace(/\n\n/g, '</p><p>')
                  .replace(/\n/g, '<br>')
                  .replace(/^/, '<p>')
                  .replace(/$/, '</p>')
                  // Convert markdown-style links [text](url) to HTML links first
                  .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" style="color: #4599FA; text-decoration: underline;">$1</a>')
                  // Then convert any remaining bare URLs to clickable links
                  .replace(/(^|[^"])(https?:\/\/[^\s<]+)(?![^<]*<\/a>)/g, '$1<a href="$2" target="_blank" style="color: #4599FA; text-decoration: underline;">$2</a>');

                newEmailData[role.key as keyof RoleEmailData] = {
                  subject: roleData.email.subject,
                  content: formattedBody,
                  preview_text: roleData.email.subject,
                  logoUrl: '/Natera logo.svg',
                  companyName: 'Natera',
                  companyWebsite: 'https://www.natera.com',
                  role: role.name
                };
              }
            });
          } else {
            // Fallback to old format - use same email for all roles
            console.log('EmailPreview - Using legacy pre-generated data format');
            const formattedBody = parsedPreGenerated.emailData.email.body
              .replace(/\n\n/g, '</p><p>')
              .replace(/\n/g, '<br>')
              .replace(/^/, '<p>')
              .replace(/$/, '</p>')
              // Convert markdown-style links [text](url) to HTML links first
              .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" style="color: #4599FA; text-decoration: underline;">$1</a>')
              // Then convert any remaining bare URLs to clickable links
              .replace(/(^|[^"])(https?:\/\/[^\s<]+)(?![^<]*<\/a>)/g, '$1<a href="$2" target="_blank" style="color: #4599FA; text-decoration: underline;">$2</a>');

            const baseEmailData = {
              subject: parsedPreGenerated.emailData.email.subject,
              content: formattedBody,
              preview_text: parsedPreGenerated.emailData.email.subject,
              logoUrl: '/Natera logo.svg',
              companyName: 'Natera',
              companyWebsite: 'https://www.natera.com'
            };

            const roles = [
              { key: 'breannaAchenbach', name: 'Breanna Achenbach - Phlebotomist' },
              { key: 'ozgurAcar', name: 'Ozgur Acar - Registered Nurse' },
              { key: 'carolAnneWeeks', name: 'Carol-anne Weeks - Healthcare Specialist' }
            ];

            roles.forEach(role => {
              newEmailData[role.key as keyof RoleEmailData] = {
                ...baseEmailData,
                role: role.name
              };
            });
          }

          setEmailData(newEmailData);
          setLoading(false);
          return;
        } catch (parseError) {
          console.error('Error parsing pre-generated email data:', parseError);
        }
      }

      // No pre-generated data available - show error
      console.error('EmailPreview - No pre-generated email data found');
      setLoading(false);

    } catch (error) {
      console.error('Error generating emails:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="email-preview">
        <div className="email-container">
          <div className="loading-message" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            color: '#666',
            fontSize: '16px'
          }}>
            Generating personalized email content...
          </div>
        </div>
      </div>
    );
  }

  const currentEmailData = emailData[currentRole];

  const roleLabels = {
    breannaAchenbach: 'Breanna Achenbach - Phlebotomist',
    ozgurAcar: 'Ozgur Acar - Registered Nurse',
    carolAnneWeeks: 'Carol-anne'
  };

  const roles = Object.keys(roleLabels) as Array<keyof typeof roleLabels>;
  const currentIndex = roles.indexOf(currentRole);

  const navigateToRole = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % roles.length
      : (currentIndex - 1 + roles.length) % roles.length;
    const newRole = roles[newIndex];
    console.log('EmailPreview - Navigating to role:', newRole, 'from', currentRole);
    console.log('EmailPreview - Available email data:', Object.keys(emailData));
    console.log('EmailPreview - Email data for new role:', emailData[newRole]);
    setCurrentRole(newRole);
  };

  if (!currentEmailData) {
    return (
      <div className="email-preview">
        <div className="email-container">
          <div className="error-message" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            color: '#666',
            fontSize: '16px'
          }}>
            No email data available. Please complete the demo setup first.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="email-preview">
      <div className="email-container">
        {/* Minimal Role Navigation Overlay */}
        <div className="role-navigation-overlay">
          <button
            className="nav-arrow-minimal"
            onClick={() => navigateToRole('prev')}
            aria-label="Previous role"
          >
            <span className="material-icons-round">chevron_left</span>
          </button>

          <div className="current-role-label">
            {roleLabels[currentRole]}
          </div>

          <button
            className="nav-arrow-minimal"
            onClick={() => navigateToRole('next')}
            aria-label="Next role"
          >
            <span className="material-icons-round">chevron_right</span>
          </button>
        </div>

        {/* Email Content */}
        <div className="email-content">
          {/* Hero Section */}
          <div className="email-section">
            <div className="hero-image-container">
              <img
                className="hero-image"
                src="/Natera%20Email%20image.png"
                alt="Professional workspace"
              />
              {/* Company Logo Overlay */}
              <div className="logo-overlay">
                {currentEmailData.logoUrl ? (
                  <img
                    src={currentEmailData.logoUrl}
                    alt={`${currentEmailData.companyName} logo`}
                    className="overlay-logo"
                  />
                ) : (
                  <img
                    src="/Natera logo.svg"
                    alt="Company logo"
                    className="overlay-logo"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Main Content - AI Generated */}
          <div className="email-section">
            <div className="content-block">
              <div
                className="email-body"
                dangerouslySetInnerHTML={{ __html: currentEmailData.content }}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="email-divider">
            <div className="divider-line"></div>
          </div>

          {/* Feedback and Chat Section */}
          <div className="email-feedback-section">
            <p className="feedback-message">
              I'm always here for feedback if this content isn't what you're looking for
            </p>
            <button className="chat-button" onClick={() => onChatClick?.(candidateInfo, currentRole)}>
              Let's Chat
            </button>
          </div>

          {/* Footer */}
          <div className="email-footer">
            <div className="footer-logo">
              {currentEmailData.logoUrl ? (
                <img src={currentEmailData.logoUrl} alt={`${currentEmailData.companyName} footer logo`} style={{maxHeight: '21px'}} />
              ) : (
                <img src="/Natera logo.svg" alt="Footer logo" style={{maxHeight: '21px'}} />
              )}
            </div>
            <div className="footer-divider"></div>
            <div className="footer-text">
              This email was sent to you because you are subscribed to our career newsletter.
            </div>
            <div className="footer-copyright">
              © 2024 {currentEmailData.companyName || 'Company'} Inc. All rights reserved.
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Below Email Container */}
      <div className="email-action-buttons">
        <button className="request-changes-btn">
          <img
            className="ai-logo-small"
            src="/AI%20Loader.gif"
            alt="AI"
          />
          <span>Request Changes</span>
        </button>
        <button className="activate-btn">
          Activate Cleo
        </button>
      </div>
    </div>
  );
};

export default EmailPreview;