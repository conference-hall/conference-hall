import c from 'classnames';
import Badge from '~/design-system/Badges';
import { Text } from '~/design-system/Typography';

type Props = { className?: string };

export function ProposalPanel({ className }: Props) {
  return (
    <section className={c('space-y-8 overflow-auto p-8', className)}>
      <div>
        <Text className="text-sm font-semibold">Abstract</Text>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>Beginner</Badge>
          <Badge>French</Badge>
        </div>
        <Text className="mt-4">
          Vous êtes les électromécaniciens 🛠 du Nautilus 🐚 et une avarie a provoqué une défaillance des générateurs !
          Vous devez à tout prix réparer la salle des machines… Pas de panique, armé d’un micro-contrôleur, de leds et
          de capteurs, vous vous attelez à remettre en marche le sous-marin, façon DIY. Au travers de ce codelab, venez
          réveiller le Maker qui sommeille en vous en s'initiant à la programmation sur ESP32, un micro-contrôleur très
          utilisé par la communauté DIY, et (re-)découvrir quelques bases d'informatique embarquée. Seul ou en binôme,
          cet atelier est accessible aux débutants en électronique comme en développement. Pour faciliter le démarrage
          des TPs, l'installation de l'outil Arduino IDE est indispensable. Attention, le nombre de places est limité à
          20 tables en binome ou en individuel!
        </Text>
      </div>
      <div>
        <Text className="text-sm font-semibold">References</Text>
        <Text className="mt-4">
          Some of you might be surprised to know that the Cloud isn't in the sky, it's undersea. Google Cloud is
          underpinned by fiber optic cables that criss-cross the globe to create one of the most advanced networks
          supporting failover, redundancy, and a highly performant virtualized network. Join Stephanie Wong on a journey
          to the bottom of the ocean and up into the sky as she discusses Google's physical network infrastructure, the
          technology that support Google Cloud's virtual private cloud, and the new world of service-oriented networking
          in the cloud. She'll dig into the inner workings of Google's decades of subsea and terrestrial cable designs,
          the network topology they've built to withstand failures, and how you can build resilient applications in the
          cloud as a result.
        </Text>
      </div>
      <div>
        <Text className="text-sm font-semibold">Message to organizers</Text>
        <Text className="mt-4">Thanks for the organization ❤️</Text>
      </div>
    </section>
  );
}
