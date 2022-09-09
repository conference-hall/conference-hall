import c from 'classnames';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  NoSymbolIcon,
  StarIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '~/design-system/Buttons';
import { H1, Text } from '~/design-system/Typography';
import { TextArea } from '~/design-system/forms/TextArea';
import { Avatar } from '~/design-system/Avatar';
import { Dialog, Disclosure } from '@headlessui/react';
import Badge from '~/design-system/Badges';
import { useNavigate, useSearchParams } from '@remix-run/react';
import { IconLabel } from '~/design-system/IconLabel';
import Select from '~/design-system/forms/Select';
import { PencilIcon } from '@heroicons/react/20/solid';

type Props = { proposal: string | null };

export function ProposalModal({ proposal }: Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return (
    <Dialog open={Boolean(proposal)} onClose={() => navigate({ pathname: `..`, search: searchParams.toString() })}>
      <Dialog.Panel>
        <div className="absolute top-0 z-20 h-screen bg-white">
          <div className="flex h-28 items-center justify-between border-b border-gray-200 bg-gray-50 py-8 px-8">
            <div>
              <Button variant="secondary">
                <ChevronLeftIcon className="mr-3 h-4 w-4" />
                Back to list
              </Button>
            </div>
            <div className="text-center">
              <Dialog.Title>
                <H1>The awesome proposal</H1>
              </Dialog.Title>
              <Text size="xs" className="mt-2">
                3 / 201
              </Text>
            </div>
            <div className="flex gap-4">
              <Select
                name="status"
                label="Status"
                options={[{ id: 'SUBMITTED', label: 'Submitted' }]}
                srOnly
                value="SUBMITTED"
              />
              <Button variant="secondary">
                <PencilIcon className="mr-3 h-3 w-3" />
                Edit
              </Button>
            </div>
          </div>
          <div className="grid h-[calc(100%-224px)] grid-cols-8 items-stretch divide-x divide-gray-200">
            <section className="col-span-2 space-y-8 overflow-auto py-8">
              <LeftPanel />
            </section>
            <section className="col-span-4 space-y-8 overflow-auto p-8">
              <ContentPanel />
            </section>
            <section className="col-span-2 space-y-8 overflow-auto">
              <RightPanel />
            </section>
          </div>
          <div className="flex h-28 items-center justify-between border-t border-gray-200 bg-gray-50 py-8 px-8">
            <div className="w-24">
              <Button variant="secondary">
                <ChevronLeftIcon className="mr-3 h-4 w-4" />
                Previous
              </Button>
            </div>
            <div className="flex flex-col items-center gap-2 font-medium">
              <Ratings />
              <Text size="sm" variant="secondary">
                Not rated yet!
              </Text>
            </div>
            <div className="w-24">
              <Button variant="secondary">
                Next
                <ChevronRightIcon className="ml-3 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}

function LeftPanel() {
  return (
    <>
      <div>
        <Text className="mx-6 text-sm font-semibold">Speakers</Text>
        <div className="mt-4">
          <SpeakerInfos />
          <SpeakerInfos />
        </div>
      </div>
      <div className="mx-6">
        <Text className="text-sm font-semibold">Formats</Text>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>Quickie</Badge>
        </div>
      </div>
      <div className="mx-6">
        <Text className="text-sm font-semibold">Categories</Text>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>Web</Badge>
          <Badge>Cloud</Badge>
          <Badge>Web</Badge>
          <Badge>Cloud</Badge>
          <Badge>Web</Badge>
          <Badge>Cloud</Badge>
        </div>
      </div>
      <div className="mx-6">
        <Text className="text-sm font-semibold">Tags</Text>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>Top speaker</Badge>
          <Badge>Awesome talk</Badge>
        </div>
      </div>
    </>
  );
}

function ContentPanel() {
  return (
    <>
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
    </>
  );
}

function RightPanel() {
  return (
    <>
      <TotalRating />
      <div className="px-6">
        <TextArea
          name="message"
          aria-label="Write a comment to other organizers"
          placeholder="Write a comment..."
          className="grow"
          rows={3}
        />
        <div className="mt-8 space-y-4">
          <div className="flex items-end gap-4">
            <Avatar photoURL="http://placekitten.com/24/24" alt="you" />
            <div className="grow">
              <Text size="xs" variant="secondary" className="pl-4">
                Benjamin Petetot
              </Text>
              <Text as="div" className="mt-1 rounded-r-md rounded-tl-md bg-gray-100 px-4 py-4">
                This talk is awesome.
              </Text>
            </div>
          </div>
          <div className="flex items-end gap-4">
            <Avatar photoURL="http://placekitten.com/24/24" alt="you" />
            <div className="grow">
              <Text size="xs" variant="secondary" className="pl-4">
                Benjamin Petetot
              </Text>
              <Text as="div" className="mt-1 rounded-r-md rounded-tl-md bg-gray-100 px-4 py-4">
                Yes!
              </Text>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Ratings({ className }: { className?: string }) {
  return (
    <div className={c('flex items-center gap-6', className)}>
      <NoSymbolIcon className="h-10 w-10" />
      <XCircleIcon className="h-10 w-10" />
      <StarIcon className="h-10 w-10" />
      <StarIcon className="h-10 w-10" />
      <StarIcon className="h-10 w-10" />
      <StarIcon className="h-10 w-10" />
      <StarIcon className="h-10 w-10" />
      <HeartIcon className="h-10 w-10" />
    </div>
  );
}

function SpeakerInfos() {
  return (
    <Disclosure as="div">
      {({ open }) => (
        <>
          <Disclosure.Button
            className={c('flex w-full items-center justify-between px-6 py-4 hover:bg-gray-50', { 'bg-gray-50': open })}
          >
            <div className="flex w-full items-center gap-3">
              <Avatar photoURL="http://placekitten.com/24/24" alt="speaker" />
              <div className="overflow-hidden">
                <Text className="truncate">Benjamin Petetot</Text>
                <Text className="truncate" variant="secondary" size="xs">
                  ben@example.com
                </Text>
              </div>
            </div>
            {open ? <ChevronDownIcon className="h-6 w-6" /> : <ChevronRightIcon className="h-6 w-6" />}
          </Disclosure.Button>
          <Disclosure.Panel className={c('space-y-4 py-4 px-6', { 'bg-gray-50': open })}>
            <div>
              <Text className="text-sm font-semibold">Biography</Text>
              <Text className="mt-4">
                Some of you might be surprised to know that the Cloud isn't in the sky, it's undersea. Google Cloud is
                underpinned by fiber optic cables that criss-cross the globe to create one of the most advanced networks
                supporting failover, redundancy, and a highly performant virtualized network.
              </Text>
            </div>
            <div>
              <Text className="text-sm font-semibold">References</Text>
              <Text className="mt-4">
                Some of you might be surprised to know that the Cloud isn't in the sky, it's undersea. Google Cloud is
                underpinned by fiber optic cables that criss-cross the globe to create one of the most advanced networks
                supporting failover, redundancy, and a highly performant virtualized network.
              </Text>
            </div>
            <div>
              <Text className="text-sm font-semibold">Survey</Text>
              <Text className="mt-4">
                Some of you might be surprised to know that the Cloud isn't in the sky, it's undersea. Google Cloud is
                underpinned by fiber optic cables that criss-cross the globe to create one of the most advanced networks
                supporting failover, redundancy, and a highly performant virtualized network.
              </Text>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

function TotalRating() {
  return (
    <Disclosure as="div">
      {({ open }) => (
        <>
          <Disclosure.Button
            className={'flex w-full items-center justify-between border-b border-gray-200 px-6 py-8 hover:bg-gray-50'}
          >
            <div className="flex items-center justify-around gap-4 font-medium">
              <IconLabel icon={StarIcon} iconClassName="text-gray-400">
                4.8
              </IconLabel>
              <IconLabel icon={HeartIcon} iconClassName="text-gray-400">
                1
              </IconLabel>
              <IconLabel icon={XCircleIcon} iconClassName="text-gray-400">
                0
              </IconLabel>
            </div>
            {open ? <ChevronDownIcon className="h-6 w-6" /> : <ChevronRightIcon className="h-6 w-6" />}
          </Disclosure.Button>
          <Disclosure.Panel className="space-y-4 border-b border-gray-200 px-6 py-8">
            <div className="flex justify-between">
              <div className="flex w-full items-center gap-3">
                <Avatar size="s" photoURL="http://placekitten.com/24/24" alt="speaker" />
                <div className="overflow-hidden">
                  <Text className="truncate">Benjamin Petetot</Text>
                </div>
              </div>
              <div className="flex items-center justify-around gap-4">
                <IconLabel icon={HeartIcon} iconClassName="text-gray-400">
                  1
                </IconLabel>
                <IconLabel icon={StarIcon} iconClassName="text-gray-400">
                  4.8
                </IconLabel>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="flex w-full items-center gap-3">
                <Avatar size="s" photoURL="http://placekitten.com/24/24" alt="speaker" />
                <div className="overflow-hidden">
                  <Text className="truncate">Benjamin Petetot</Text>
                </div>
              </div>
              <div className="flex items-center justify-around gap-4">
                <IconLabel icon={HeartIcon} iconClassName="text-gray-400">
                  1
                </IconLabel>
                <IconLabel icon={StarIcon} iconClassName="text-gray-400">
                  4.8
                </IconLabel>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
