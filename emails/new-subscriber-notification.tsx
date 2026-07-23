import { Body, Container, Head, Html, Preview, Section, Text } from "react-email";

const colors = {
  kibanda: "#1B2A20",
  husk: "#EDE3D0",
  roast: "#3B241A",
  roastMuted: "#6b5344",
  gold: "#C89B3C",
};

const fontDisplay = "Georgia, 'Times New Roman', serif";
const fontBody = "Verdana, Arial, sans-serif";
const fontMono = "'Courier New', Courier, monospace";

interface NewSubscriberNotificationProps {
  email: string;
  signedUpAt: string;
}

export function NewSubscriberNotification({
  email,
  signedUpAt,
}: NewSubscriberNotificationProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{email} just joined the Founding Fifty.</Preview>
      <Body style={{ backgroundColor: colors.husk, margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: "480px", margin: "0 auto", padding: "0 0 32px" }}>
          <Section style={{ backgroundColor: colors.kibanda, padding: "20px 28px" }}>
            <Text
              style={{
                margin: 0,
                fontFamily: fontMono,
                fontWeight: 700,
                fontSize: "13px",
                letterSpacing: "0.18em",
                color: colors.gold,
              }}
            >
              MUKAGO
            </Text>
          </Section>

          <Section style={{ padding: "28px 28px 8px" }}>
            <Text
              style={{
                margin: "0 0 4px",
                fontFamily: fontMono,
                fontWeight: 700,
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: colors.gold,
              }}
            >
              New Founding Fifty signup
            </Text>
            <Text
              style={{
                margin: "0 0 20px",
                fontFamily: fontDisplay,
                fontWeight: 700,
                fontSize: "22px",
                lineHeight: 1.3,
                color: colors.roast,
              }}
            >
              {email}
            </Text>
            <Text
              style={{
                margin: 0,
                fontFamily: fontBody,
                fontSize: "14px",
                lineHeight: 1.6,
                color: colors.roastMuted,
              }}
            >
              Signed the pact at {signedUpAt}. Already recorded in Supabase and added to the
              Resend audience, and their welcome email has been sent.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

NewSubscriberNotification.PreviewProps = {
  email: "you@somewhere.com",
  signedUpAt: new Date().toUTCString(),
} satisfies NewSubscriberNotificationProps;

export default NewSubscriberNotification;
