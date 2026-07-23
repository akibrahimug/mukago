import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "react-email";

const colors = {
  kibanda: "#1B2A20",
  kibanda2: "#142019",
  cherry: "#7A1F2B",
  husk: "#EDE3D0",
  huskDim: "#DCCFB4",
  roast: "#3B241A",
  roastMuted: "#6b5344",
  gold: "#C89B3C",
};

// Web-safe stacks only, no external @font-face. Custom web fonts render in
// very few email clients anyway (Outlook ignores them entirely), and Resend
// flags externally-hosted font URLs as a deliverability risk since they
// don't match the sending domain, particularly for Gmail.
const fontDisplay = "Georgia, 'Times New Roman', serif";
const fontBody = "Verdana, Arial, sans-serif";
const fontMono = "'Courier New', Courier, monospace";

interface WelcomeEmailProps {
  email: string;
}

export function WelcomeEmail({ email }: WelcomeEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>The pact is signed. You&apos;re one of the Founding Fifty.</Preview>
      <Body style={{ backgroundColor: colors.husk, margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "0 0 40px" }}>
          <Section style={{ backgroundColor: colors.kibanda, padding: "28px 32px" }}>
            <Text
              style={{
                margin: 0,
                fontFamily: fontMono,
                fontWeight: 700,
                fontSize: "15px",
                letterSpacing: "0.18em",
                color: colors.gold,
              }}
            >
              MUKAGO
            </Text>
          </Section>

          <Section style={{ padding: "40px 32px 8px" }}>
            <Heading
              as="h1"
              style={{
                margin: "0 0 20px",
                fontFamily: fontDisplay,
                fontWeight: 600,
                fontSize: "28px",
                lineHeight: 1.2,
                color: colors.roast,
              }}
            >
              The pact is signed.
            </Heading>

            <Text
              style={{
                margin: "0 0 16px",
                fontFamily: fontBody,
                fontSize: "16px",
                lineHeight: 1.65,
                color: colors.roast,
              }}
            >
              Among the people of Buganda, two friends who chose to become kin would take a
              single coffee bean, break it in half, and each swallow their piece. No scribe, no
              seal. Just a promise. They called it omukago. The pact. You&apos;ve just taken
              yours.
            </Text>

            <Text
              style={{
                margin: "0 0 16px",
                fontFamily: fontBody,
                fontSize: "16px",
                lineHeight: 1.65,
                color: colors.roast,
              }}
            >
              <strong>{email}</strong> is now one of our Founding Fifty, the first witnesses to
              this farm, from planting day to the first cup.
            </Text>

            <table
              role="presentation"
              width="100%"
              cellPadding={0}
              cellSpacing={0}
              style={{
                margin: "28px 0",
                borderTop: `1px dashed ${colors.huskDim}`,
                borderBottom: `1px dashed ${colors.huskDim}`,
              }}
            >
              <tr>
                <td style={{ padding: "22px 4px", textAlign: "center" }}>
                  <Text
                    style={{
                      margin: 0,
                      fontFamily: fontDisplay,
                      fontWeight: 700,
                      fontSize: "18px",
                      lineHeight: 1.4,
                      color: colors.cherry,
                    }}
                  >
                    A relationship that only survives when the price is generous was never a
                    relationship at all.
                  </Text>
                </td>
              </tr>
            </table>

            <Text
              style={{
                margin: "0 0 8px",
                fontFamily: fontMono,
                fontWeight: 700,
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: colors.cherry,
              }}
            >
              What happens next
            </Text>
            <Text
              style={{
                margin: "0 0 6px",
                fontFamily: fontBody,
                fontSize: "15px",
                lineHeight: 1.7,
                color: colors.roast,
              }}
            >
              <strong>December 2026:</strong> the land is prepared.
            </Text>
            <Text
              style={{
                margin: "0 0 6px",
                fontFamily: fontBody,
                fontSize: "15px",
                lineHeight: 1.7,
                color: colors.roast,
              }}
            >
              <strong>March&ndash;April 2027:</strong> the trees go into the ground with the
              rains.
            </Text>
            <Text
              style={{
                margin: "0 0 24px",
                fontFamily: fontBody,
                fontSize: "15px",
                lineHeight: 1.7,
                color: colors.roast,
              }}
            >
              <strong>2029:</strong> first harvest. Batch 001, small and honest, goes only to the
              Founding Fifty. You&apos;ll have first refusal before anyone else knows we exist.
            </Text>

            <Text
              style={{
                margin: "0 0 4px",
                fontFamily: fontBody,
                fontSize: "15px",
                lineHeight: 1.65,
                color: colors.roast,
              }}
            >
              We&apos;ll write only when the farm actually moves, a few emails a year, nothing
              else. No noise, no reselling your details, no surprises.
            </Text>

            <Text
              style={{
                margin: "32px 0 0",
                fontFamily: fontDisplay,
                fontStyle: "italic",
                fontSize: "15px",
                lineHeight: 1.6,
                color: colors.roastMuted,
              }}
            >
              Ibrahim
              <br />
              Kangulumira, Kayunga, Uganda
            </Text>
          </Section>

          <Hr style={{ borderColor: colors.huskDim, margin: "32px 32px 20px" }} />

          <Section style={{ padding: "0 32px" }}>
            <Text
              style={{
                margin: 0,
                fontFamily: fontMono,
                fontSize: "11px",
                lineHeight: 1.7,
                color: colors.roastMuted,
              }}
            >
              You&apos;re receiving this because you signed up at mukago.co.uk. Didn&apos;t
              mean to? Just reply, or{" "}
              <Link
                href="mailto:ibrahim@mukago.co.uk?subject=Remove%20me%20from%20the%20list"
                style={{ color: colors.roastMuted, textDecoration: "underline" }}
              >
                let us know
              </Link>{" "}
              and we&apos;ll take you off the list.
            </Text>
            <Text
              style={{
                margin: "12px 0 0",
                fontFamily: fontMono,
                fontSize: "11px",
                color: colors.roastMuted,
              }}
            >
              © {new Date().getFullYear()} Mukago Ltd. Grown in Kangulumira, Kayunga, Uganda.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

WelcomeEmail.PreviewProps = {
  email: "you@somewhere.com",
} satisfies WelcomeEmailProps;

export default WelcomeEmail;
