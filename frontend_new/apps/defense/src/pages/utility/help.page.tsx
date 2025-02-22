import React from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Paper, Divider } from '@mui/material';
import { ChevronDown, Mail, Phone, Globe } from 'lucide-react';

const HelpPage: React.FC = () => {
  const faqs = [
    {
      question: 'How do I transfer property using QR codes?',
      answer: 'To transfer property using QR codes: 1) Scan the QR code on the item, 2) Select the recipient from the personnel list, 3) Submit the transfer request. The recipient will be notified and must approve the transfer.'
    },
    {
      question: 'What should I do if an item is damaged?',
      answer: 'If an item is damaged: 1) Report the damage immediately through the property details page, 2) Document the damage with photos if possible, 3) Submit a damage report. Your chain of command will be notified and provide further instructions.'
    },
    {
      question: 'How do I verify sensitive items?',
      answer: 'To verify sensitive items: 1) Navigate to the Sensitive Items page, 2) Click "Verify Now", 3) Scan each item\'s QR code or enter the serial number manually, 4) Submit the verification. All sensitive items must be verified according to your unit\'s schedule.'
    },
    {
      question: 'What are the different user roles?',
      answer: 'HandReceipt has three main user roles: 1) Officers - can generate QR codes and manage all property, 2) NCOs - can manage property and personnel within their unit, 3) Soldiers - can view their assigned property and initiate transfers.'
    }
  ];

  const supportContacts = {
    s6: {
      title: 'S6 - Technical Support',
      phone: '(555) 123-4567',
      email: 's6support@unit.mil'
    },
    s4: {
      title: 'S4 - Property Book Office',
      phone: '(555) 123-4568',
      email: 's4pbo@unit.mil'
    }
  };

  return (
    <Box className="help-page" sx={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Help & Documentation
      </Typography>
      
      {/* Quick Start Guide */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Quick Start Guide
        </Typography>
        <Typography paragraph>
          HandReceipt is a secure property management system that uses QR codes and blockchain verification
          to track military property. This system enables efficient property transfers, inventory management,
          and sensitive item tracking.
        </Typography>
      </Paper>

      {/* FAQs */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Frequently Asked Questions
      </Typography>
      {faqs.map((faq, index) => (
        <Accordion key={index} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ChevronDown />}>
            <Typography>{faq.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{faq.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Support Contacts */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Support Contacts
      </Typography>
      <Paper sx={{ p: 3 }}>
        {Object.entries(supportContacts).map(([key, contact]) => (
          <Box key={key} sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {contact.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Phone size={18} style={{ marginRight: '8px' }} />
              <Typography>{contact.phone}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Mail size={18} style={{ marginRight: '8px' }} />
              <Typography>{contact.email}</Typography>
            </Box>
            {key !== Object.keys(supportContacts)[Object.keys(supportContacts).length - 1] && (
              <Divider sx={{ my: 2 }} />
            )}
          </Box>
        ))}
      </Paper>

      {/* Additional Resources */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Additional Resources
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Globe size={18} style={{ marginRight: '8px' }} />
          <Typography>
            Visit the <a href="https://intranet.unit.mil/handreceipt" target="_blank" rel="noopener noreferrer">HandReceipt Documentation Portal</a> for detailed guides and training materials.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default HelpPage;
