import { Reveal } from "@/components/reveal";
import { SignupForm } from "@/components/signup-form";

const BeanSprite = () => (
  <svg className="sprite" aria-hidden="true">
    <symbol id="bean" viewBox="0 0 200 220">
      <path
        className="bean-outline"
        d="M100 10C60 10 20 45 20 105C20 165 55 210 100 210C145 210 180 165 180 105C180 45 140 10 100 10Z"
      />
      <path
        className="bean-seam"
        d="M100 20C70 55 130 80 100 110C70 140 130 165 100 200"
      />
    </symbol>
  </svg>
);

export default function Home() {
  return (
    <>
      <BeanSprite />

      <a className="skip-link" href="#signup">
        Skip to sign up
      </a>

      <header className="topbar">
        <div className="topbar__inner">
          <a className="wordmark" href="#top">
            <svg className="mark mark--sm" aria-hidden="true">
              <use href="#bean" />
            </svg>
            MUKAGO
          </a>
          <a className="topbar__cta" href="#signup">
            Join the Founding Fifty
          </a>
        </div>
      </header>

      <main id="top">
        <section className="section hero">
          <div className="hero__inner">
            <svg className="mark mark--lg" aria-hidden="true">
              <use href="#bean" />
            </svg>

            <h1 className="hero__title">Mukago</h1>
            <p className="hero__subtitle">We are kin.</p>
            <p className="hero__gloss">omukago (n.) · the Buganda friendship pact</p>

            <p className="hero__lede">
              Among the people of Buganda, two friends who chose to become kin would take a
              single coffee bean, break it in half, and each swallow their piece. No scribe, no
              seal. Just a promise. They called it omukago. The pact.
            </p>

            <p className="hero__lede">
              We still keep it. We grow our half in Kayunga. You choose yours, wherever in the
              world you are. Same bean, same old promise.
            </p>

            <div className="hero__actions">
              <a className="scroll-cue" href="#why">
                <span>The story</span>
                <svg
                  width="14"
                  height="20"
                  viewBox="0 0 14 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M7 1V19M7 19L1 13M7 19L13 13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <a className="text-link" href="#signup">
                or jump straight to the signup →
              </a>
            </div>
          </div>
        </section>

        <div className="banner">
          <p className="banner__line">Grown on our own plot in Kangulumira, Kayunga, Uganda</p>
          <p className="banner__line banner__line--dates">
            Planting March&ndash;April 2027 · First harvest 2029
          </p>
        </div>

        <section className="section why" id="why">
          <Reveal className="why__inner">
            <h2 className="why__title">Why Mukago exists.</h2>

            <p className="why__body">
              This story starts with my grandmother, who raised me until I was nine, in a
              village called Kafunta, twenty minutes from where I now grow coffee myself. She
              grew coffee too, and when it was ready each year, men rode round on bicycles to
              buy it as kiboko, the dried whole cherry farmers sell before anyone hulls it. They
              paid whatever they liked, not because they were cruel, but because they needed
              their own margin too, and nobody had ever built her a way to ask for more. What
              she did get never lasted long. Those trees are still standing. My aunt tends them
              now. The same thing still happens to her.
            </p>

            <p className="why__body">
              She was not unlucky. She was ordinary. Real costs exist all along the chain, and
              none of that is the problem. The problem is what is left once they are paid: still
              pennies to the grower, still pounds to everyone after her. Not stolen. Just never
              proven.
            </p>

            <p className="why__body">
              Mukago is what happens when the farmer refuses to let go of the bean. I grow it,
              dry it, ship it, and sell it to you myself, so I see every real cost and know
              exactly what is fair.
            </p>

            <p className="why__body">
              We need profit too, enough to survive and keep planting. But fair value comes
              first, ahead of a bigger number for us. Our caretaker and the growers who join us
              later get paid what we agree before the coffee changes hands. You get an honest
              one, the same coffee and the same story, every time.
            </p>

            <p className="why__statement">
              A relationship that only survives when the price is generous was never a
              relationship at all.
            </p>
          </Reveal>
        </section>

        <section className="section how">
          <Reveal className="how__inner">
            <h2 className="how__title">How we work.</h2>

            <p className="how__body">
              We grow it ourselves first. Every bag starts on our own plot in Kangulumira,
              picked, dried, and shipped by us, because the chain only stays honest if the
              farmer never lets go of the bean.
            </p>

            <p className="how__body">
              We pick ripe cherry only, and take the time to wash and dry it properly. Nothing
              is rushed to make a shipping date.
            </p>

            <p className="how__body">
              Every batch is dated and numbered, so you always know exactly which harvest is in
              your bag, good years and thin ones both.
            </p>
          </Reveal>
        </section>

        <section className="section promise">
          <Reveal className="promise__inner">
            <h2 className="promise__title">What we promise.</h2>

            <p className="promise__body">
              The grower gets paid first, and paid fairly. Every time. That is not a value
              statement. It is the whole reason this exists.
            </p>

            <p className="promise__body">
              No bicycle buyer&apos;s arithmetic, ever, not even once we are big enough that
              cutting that corner would be easy.
            </p>

            <p className="promise__body">
              We tell you the truth about the harvest. If it was a hard year, we will say so.
            </p>
          </Reveal>
        </section>

        <section className="section who">
          <Reveal className="who__inner">
            <h2 className="who__title">Who we work with.</h2>

            <p className="who__body">
              Right now, it is just us: a caretaker on our own plot in Kangulumira, who shares
              in every harvest.
            </p>

            <p className="who__body">
              Soon, neighbouring growers in Kayunga join us, paid on the terms above, agreed
              before the coffee changes hands.
            </p>
          </Reveal>
        </section>

        <section className="section signup" id="signup">
          <Reveal className="signup__inner">
            <h2 className="signup__title">Be one of our first fifty.</h2>
            <p className="signup__body">
              Every pact needs witnesses. Leave your email and you&apos;ll watch this farm grow
              from planting day, and when the first harvest comes, Batch 001 is yours before
              anyone else knows we exist.
            </p>

            <SignupForm />
          </Reveal>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <svg className="mark mark--sm" aria-hidden="true">
              <use href="#bean" />
            </svg>
            <div>
              <p className="footer__word">MUKAGO</p>
              <p className="footer__ipa">From omukago, Luganda for the pact</p>
            </div>
          </div>
          <p className="footer__tagline">Grown in Kangulumira, Kayunga, Uganda.</p>
          <p className="footer__copy">© 2026 Mukago Ltd</p>
        </div>
      </footer>
    </>
  );
}
