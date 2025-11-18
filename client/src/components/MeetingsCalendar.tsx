import { Calendar, Clock, MapPin, ExternalLink, AlertCircle } from 'lucide-react';
import { upcomingMeetings } from '@/lib/mock-data';

export function MeetingsCalendar() {
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

  return (
    <section className="py-24 bg-white dark:bg-black">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Upcoming Shareholder Meetings
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Exercise your governance rights across 500 companies
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {upcomingMeetings.map((meeting) => (
            <div
              key={`${meeting.symbol}-${meeting.date}`}
              className={`group rounded-xl border p-6 shadow-sm transition-all hover:shadow-lg ${
                meeting.important
                  ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20'
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {meeting.company}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({meeting.symbol})
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getMeetingTypeBadge(meeting.type)}`}>
                      {meeting.type}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(meeting.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{meeting.time} {meeting.timezone}</span>
                    </div>
                  </div>
                </div>

                {meeting.important && (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Agenda Items:
                </h4>
                <ul className="space-y-1">
                  {meeting.agenda.map((item, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-2"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 border-t pt-4 flex items-center justify-between">
                <a
                  href={meeting.proxyStatementUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <span>Proxy Statement</span>
                  <ExternalLink className="h-3 w-3" />
                </a>

                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                  Vote Now
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 rounded-lg bg-blue-50 px-4 py-2 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">
              Track all 500 companies' governance events
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}