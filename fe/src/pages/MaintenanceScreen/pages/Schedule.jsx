import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { ScheduleProvider, useSchedule } from '../context/ScheduleContext';
import ScheduleHeader from '../components/ScheduleHeader';
import ScheduleFilters from '../components/ScheduleFilters';
import ScheduleMainContent from '../components/ScheduleMainContent';
import ScheduleSidebar from '../components/ScheduleSidebar';
import ScheduleModalContainer from '../components/ScheduleModalContainer';

const ScheduleView = () => {
  const { data, view, form } = useSchedule();

  if (!data || !view || !form) {
    return (
      <div className='p-3'>
        <div className='text-center py-5'>
          <div className='spinner-border text-primary mb-3' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
          <h5>Loading schedule data...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className='p-3'>
      <ScheduleHeader />
      <ScheduleFilters />

      <Row>
        <Col xl={8} lg={7} className='mb-3'>
          <ScheduleMainContent />
        </Col>

        <Col xl={4} lg={5}>
          <ScheduleSidebar />
        </Col>
      </Row>

      <ScheduleModalContainer />
    </div>
  );
};

export default function Schedule() {
  return (
    <ScheduleProvider>
      <ScheduleView />
    </ScheduleProvider>
  );
}
