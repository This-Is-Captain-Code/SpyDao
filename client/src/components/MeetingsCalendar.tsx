import { Calendar, Clock, ExternalLink, AlertCircle } from 'lucide-react';
import { upcomingMeetings } from '@/lib/mock-data';
import { useState } from 'react';

export function MeetingsCalendar() {
  const [isPaused, setIsPaused] = useState(false);

  const getMeetingTypeBadge = (type: string) => {
    switch (type) {
      case 'Annual':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Special':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Duplicate meetings multiple times for seamless infinite scrolling
  const duplicatedMeetings = [...upcomingMeetings, ...upcomingMeetings, ...upcomingMeetings, ...upcomingMeetings];

  return (
    <section className="py-24 bg-transparent">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Side - Vertical Scrolling Cards in Two Columns */}
          <div 
            className="relative h-[600px] overflow-hidden grid grid-cols-2 gap-3"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 16%, black 32%, black 68%, transparent 84%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 16%, black 32%, black 68%, transparent 84%, transparent 100%)',
            }}
          >
            
            {/* Column 1 - Scrolling Up */}
            <div 
              className={`flex flex-col gap-3 animate-vertical-marquee ${isPaused ? 'animation-paused' : ''}`}
            >
              {duplicatedMeetings.filter((_, index) => index % 2 === 0).map((meeting, index) => (
                <div
                  key={`col1-${meeting.symbol}-${meeting.date}-${index}`}
                  className={`flex-shrink-0 rounded-lg border p-3 shadow-sm transition-all hover:shadow-md glass-card ${
                    meeting.important
                      ? 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {meeting.company}
                        </h3>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          ({meeting.symbol})
                        </span>
                        <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${getMeetingTypeBadge(meeting.type)}`}>
                          {meeting.type}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-gray-400 dark:text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(meeting.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{meeting.time}</span>
                        </div>
                      </div>
                    </div>

                    {meeting.important && (
                      <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  <div className="mt-2">
                    <ul className="space-y-0.5">
                      {meeting.agenda.slice(0, 2).map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
                          <div className="h-1 w-1 bg-blue-500 rounded-full mr-1.5"></div>
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                      {meeting.agenda.length > 2 && (
                        <li className="text-xs text-gray-400 dark:text-gray-500">
                          +{meeting.agenda.length - 2} more
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <a
                      href={meeting.proxyStatementUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <span>Proxy</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>

                    <button className="rounded-md bg-black px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-gray-800">
                      Vote
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2 - Scrolling Down */}
            <div 
              className={`flex flex-col gap-3 animate-vertical-marquee-down ${isPaused ? 'animation-paused' : ''}`}
            >
              {duplicatedMeetings.filter((_, index) => index % 2 === 1).map((meeting, index) => (
                <div
                  key={`col2-${meeting.symbol}-${meeting.date}-${index}`}
                  className={`flex-shrink-0 rounded-lg border p-3 shadow-sm transition-all hover:shadow-md glass-card ${
                    meeting.important
                      ? 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {meeting.company}
                        </h3>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          ({meeting.symbol})
                        </span>
                        <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${getMeetingTypeBadge(meeting.type)}`}>
                          {meeting.type}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-gray-400 dark:text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(meeting.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{meeting.time}</span>
                        </div>
                      </div>
                    </div>

                    {meeting.important && (
                      <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  <div className="mt-2">
                    <ul className="space-y-0.5">
                      {meeting.agenda.slice(0, 2).map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
                          <div className="h-1 w-1 bg-blue-500 rounded-full mr-1.5"></div>
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                      {meeting.agenda.length > 2 && (
                        <li className="text-xs text-gray-400 dark:text-gray-500">
                          +{meeting.agenda.length - 2} more
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <a
                      href={meeting.proxyStatementUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <span>Proxy</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>

                    <button className="rounded-md bg-black px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-gray-800">
                      Vote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Hero Text */}
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              Upcoming Shareholder Meetings
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              Exercise your governance rights across 500 companies. Every shareholder meeting is an opportunity to shape corporate America's future.
            </p>
            <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
              SPY DAO aggregates all upcoming meetings, proxy statements, and voting opportunities in one place. Your stake equals your voice—make it heard.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">Track all 500 companies</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}