'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { LogOut, User } from 'lucide-react';

export function LoginButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  if (session?.user) {
    return (
      <Menu as="div" className="relative">
        <Menu.Button className="flex items-center space-x-2 rounded-full focus:outline-none">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium border-2 border-white hover:border-gray-200 transition-colors">
            {session.user.name?.[0] || 'U'}
          </div>
        </Menu.Button>
        
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100">
            <div className="px-4 py-4">
              <p className="text-sm font-medium text-gray-900">
                {session.user.name}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {session.user.email}
              </p>
            </div>

            <div className="p-2">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => signOut()}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-red-600`}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    );
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <User className="h-4 w-4" />
      Sign in
    </button>
  );
}
