// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { getTeamsMeetingLink } from '../utils/GetMeetingLink';
import { generateTheme } from '../utils/ThemeGenerator';
import { JoinMeeting } from './JoinMeeting';

const validTeamsMeetingLink = getTeamsMeetingLink(
  '?meetingURL=https%3A%2F%2Fteams.microsoft.com%2Fl%2Fmeetup-join%2F19%253ameeting_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%2540thread.v2%2F0%3Fcontext%3D%257b%2522Tid%2522%253a%252200000000-0000-0000-0000-000000000000%2522%252c%2522Oid%2522%253a%252200000000-0000-0000-0000-000000000000%2522%257d'
).meetingLink;

const validMockRoomsLink = 'http://localhost:8080/visit?roomId=mockRoomId&userId=mockUserId';

describe('JoinMeeting', () => {
  it('should render header when page is loaded', async () => {
    const meeting = render(
      <JoinMeeting
        config={{
          communicationEndpoint: 'enpoint=test_endpoint;',
          microsoftBookingsUrl: '',
          chatEnabled: true,
          screenShareEnabled: true,
          companyName: '',
          theme: generateTheme('#FFFFFF'),
          waitingTitle: '',
          waitingSubtitle: '',
          logoUrl: ''
        }}
        onJoinMeeting={jest.fn()}
      />
    );

    const headers = meeting.queryAllByTestId('header');

    expect(headers.length).toBe(1);
  });

  it('join button should be disabled when meeting link does not exist', async () => {
    const meeting = render(
      <JoinMeeting
        config={{
          communicationEndpoint: 'enpoint=test_endpoint;',
          microsoftBookingsUrl: '',
          chatEnabled: true,
          screenShareEnabled: true,
          companyName: '',
          theme: generateTheme('#FFFFFF'),
          waitingTitle: '',
          waitingSubtitle: '',
          logoUrl: ''
        }}
        onJoinMeeting={jest.fn()}
      />
    );

    const joinButton = meeting.getByTestId('join-call-button');
    expect(joinButton).toBeDefined();
  });

  it.each([[validTeamsMeetingLink], [validMockRoomsLink]])(
    'should enable join button when meeting link is added',
    async (meetingLink: string) => {
      global.window = Object.create(window);
      const url = 'http://localhost:8080';
      Object.defineProperty(window, 'location', {
        value: {
          origin: url
        }
      });
      expect(window.location.origin).toEqual(url);
      const meeting = render(
        <JoinMeeting
          config={{
            communicationEndpoint: 'enpoint=test_endpoint;',
            microsoftBookingsUrl: '',
            chatEnabled: true,
            screenShareEnabled: true,
            companyName: '',
            theme: generateTheme('#FFFFFF'),
            waitingTitle: '',
            waitingSubtitle: '',
            logoUrl: ''
          }}
          onJoinMeeting={jest.fn()}
        />
      );

      const joinButton = meeting.getByTestId('join-call-button');

      expect(joinButton?.getAttribute('disabled')).toBeFalsy();
    }
  );

  it.each([[validTeamsMeetingLink], [validMockRoomsLink]])(
    'should call onJoinMeeting prop when join button is clicked',
    async (meetingLink: string) => {
      global.window = Object.create(window);
      const url = 'http://localhost:8080';
      Object.defineProperty(window, 'location', {
        value: {
          origin: url
        }
      });
      const testFn = jest.fn();
      const meeting = render(
        <JoinMeeting
          config={{
            communicationEndpoint: 'endpoint=test_endpoint;',
            microsoftBookingsUrl: '',
            chatEnabled: true,
            screenShareEnabled: true,
            companyName: '',
            theme: generateTheme('#FFFFFF'),
            waitingTitle: '',
            waitingSubtitle: '',
            logoUrl: ''
          }}
          onJoinMeeting={testFn}
        />
      );

      const textField = meeting.getByTestId('meeting-link-textfield');
      const joinButton = meeting.getByTestId('join-call-button');
      React.act(() => {
        fireEvent.change(textField, { target: { value: meetingLink } });
        fireEvent.click(joinButton);
      });

      expect(testFn).toBeCalled();
    }
  );
});

describe('Error handling', () => {
  // FluentUI's TextField doesn't immediatelly call onGetErrorMessage when the value changes.
  // Instead it is called on a timer.
  // So we need fake timers to wait in the test until the callback does get called.
  // https://github.com/microsoft/fluentui/discussions/16240#discussioncomment-217231
  beforeEach(() => {
    // Use modern timers, otherwise jest.runAllTimers() later in the test might fail due to the
    // Lodash's debounce usage in TextField
    // https://github.com/facebook/jest/issues/3465#issuecomment-623393230
    jest.useFakeTimers('modern');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const errorMessage = 'This meeting link is invalid. Verify your meeting link URL.';

  it('must show error message when meeting link is invalid', async () => {
    const meeting = render(
      <JoinMeeting
        config={{
          communicationEndpoint: 'enpoint=test_endpoint;',
          microsoftBookingsUrl: '',
          chatEnabled: true,
          screenShareEnabled: true,
          companyName: '',
          theme: generateTheme('#FFFFFF'),
          waitingTitle: '',
          waitingSubtitle: '',
          logoUrl: ''
        }}
        onJoinMeeting={jest.fn()}
      />
    );

    const textField = meeting.getByTestId('meeting-link-textfield');
    await React.act(() => {
      fireEvent.change(textField, { target: { value: 'bad meeting link' } });
    });
    const errorMessages = meeting.queryAllByRole('alert');
    expect(errorMessages.length).toBe(1);
  });

  it.each([[validTeamsMeetingLink], [validMockRoomsLink]])(
    'must not show error message when meeting link is valid',
    async (meetingLink: string) => {
      global.window = Object.create(window);
      const url = 'http://localhost:8080';
      Object.defineProperty(window, 'location', {
        value: {
          origin: url
        }
      });
      const meeting = render(
        <JoinMeeting
          config={{
            communicationEndpoint: 'enpoint=test_endpoint;',
            microsoftBookingsUrl: '',
            chatEnabled: true,
            screenShareEnabled: true,
            companyName: '',
            theme: generateTheme('#FFFFFF'),
            waitingTitle: '',
            waitingSubtitle: '',
            logoUrl: ''
          }}
          onJoinMeeting={jest.fn()}
        />
      );

      const textField = meeting.getByRole('textbox');
      React.act(() => {
        fireEvent.change(textField, { target: { value: meetingLink } });
      });
      jest.runAllTimers();
      const allText = meeting.queryAllByText(errorMessage);
      expect(allText.length).toBe(0);
    }
  );
});
