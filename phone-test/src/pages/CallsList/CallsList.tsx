import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import { PAGINATED_CALLS } from '../../gql/queries';
import { Typography, Spacer, Pagination } from '@aircall/tractor';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CallDetail from '../CallDetail';
import {
  CALLS_PER_PAGE,
  pageSizeOptions
} from '../options';
import { groupCallsIntoPages, filterCalls, sortCallsByDate } from '../helpers';
import { CallGroup } from './callsList.decl';
import { CallFilterBar } from './CallFilterBar';

const PaginationWrapper = styled.div`
  > div {
    width: inherit;
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
`;

const CallsListPage = () => {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const pageQueryParams = search.get('page');
  const activePage = pageQueryParams ? parseInt(pageQueryParams) : 1;

  const [selectedCallPerPage, setSelectedCallPerPage] = useState(CALLS_PER_PAGE);
  const [callTypeFilter, setCallTypeFilter] = useState('');
  const [directionFilter, setDirectionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [callsPage, setCallsPage] = useState<CallGroup>({});
  const [totalFilteredCalls, setTotalFilteredCalls] = useState(0);
  const [paginatedCalls, setPaginatedCalls] = useState<CallGroup[]>([]);

  const { loading, error, data } = useQuery(PAGINATED_CALLS, {
    variables: { offset: 0, limit: 200 }
  });

  useEffect(() => {
    setCurrentPage(activePage);
  }, [activePage]);

  useEffect(() => {
    if (data) {
      const { nodes: calls } = data.paginatedCalls;

      const orderedCalls = sortCallsByDate(calls);

      const filteredCalls = filterCalls(orderedCalls, callTypeFilter, directionFilter);
      setTotalFilteredCalls(filteredCalls.length);
      const newPaginatedCalls = groupCallsIntoPages(
        filteredCalls,
        selectedCallPerPage
      ) as CallGroup[];

      setPaginatedCalls(newPaginatedCalls);
    }
  }, [data, callTypeFilter, directionFilter, selectedCallPerPage]);

  useEffect(() => {
    setCallsPage(paginatedCalls[currentPage]);
  }, [paginatedCalls, currentPage]);

  if (loading) return <p>Loading calls...</p>;
  if (error) return <p>ERROR</p>;

  const handleCallOnClick = (callId: string) => {
    navigate(`/calls/${callId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1);
    navigate(`/calls/?page=${page}`);
  };

  return (
    <>
      <Typography variant="displayM" textAlign="center" py={3}>
        Calls History
      </Typography>
      <CallFilterBar
        callTypeSelectionChange={setCallTypeFilter}
        callDirectionSelectionChange={setDirectionFilter}
      />
      <div style={{ height: '60vh', overflow: 'auto' }}>
        <Spacer space={3} direction="vertical" fluid>
          {callsPage ? (
            <>
              {Object.entries(callsPage as Record<string, Call[]>).map(
                ([date, calls]: [string, Call[]]) => (
                  <div key={date}>
                    <h2>Date: {date}</h2>
                    {calls.map((call: Call) => (
                      <CallDetail key={call.id} call={call as Call} onClick={handleCallOnClick} />
                    ))}
                  </div>
                )
              )}
            </>
          ) : (
            <div>No Content</div>
          )}
        </Spacer>
      </div>
      {totalFilteredCalls > 0 && (
        <PaginationWrapper>
          <Pagination
            activePage={currentPage}
            pageSize={selectedCallPerPage}
            pageSizeOptions={pageSizeOptions}
            onPageChange={handlePageChange}
            recordsTotalCount={totalFilteredCalls}
            onPageSizeChange={callsPerPage => {
              setSelectedCallPerPage(callsPerPage);
              setCurrentPage(0);
            }}
          />
        </PaginationWrapper>
      )}
    </>
  );
};

export default CallsListPage;
