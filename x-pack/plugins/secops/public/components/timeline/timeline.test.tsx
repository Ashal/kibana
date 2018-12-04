/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { mount } from 'enzyme';
import { noop, pick } from 'lodash/fp';
import * as React from 'react';
import { MockedProvider } from 'react-apollo/test-utils';
import { DragDropContext } from 'react-beautiful-dnd';

import { eventsQuery } from '../../containers/events/events.gql_query';
import { mockECSData } from '../../mock/mock_ecs';
import { ColumnHeaderType } from './body/column_headers/column_header';
import { headers } from './body/column_headers/headers';
import { columnRenderers, rowRenderers } from './body/renderers';
import { Sort } from './body/sort';
import { mockDataProviders } from './data_providers/mock/mock_data_providers';
import { Timeline } from './timeline';

describe('Timeline', () => {
  const sort: Sort = {
    columnId: 'timestamp',
    sortDirection: 'descending',
  };

  const mocks = [
    {
      request: { query: eventsQuery },
      result: {
        data: {
          events: mockECSData,
        },
      },
    },
  ];

  describe('rendering', () => {
    test('it renders the timeline header', () => {
      const wrapper = mount(
        <DragDropContext onDragEnd={noop}>
          <MockedProvider mocks={mocks}>
            <Timeline
              id="foo"
              columnHeaders={headers}
              columnRenderers={columnRenderers}
              dataProviders={mockDataProviders}
              onColumnSorted={noop}
              onDataProviderRemoved={noop}
              onFilterChange={noop}
              onRangeSelected={noop}
              onToggleDataProviderEnabled={noop}
              range={'1 Day'}
              rowRenderers={rowRenderers}
              sort={sort}
              width={1000}
            />
          </MockedProvider>
        </DragDropContext>
      );

      expect(wrapper.find('[data-test-subj="timelineHeader"]').exists()).toEqual(true);
    });

    test('it renders the timeline body', () => {
      const wrapper = mount(
        <DragDropContext onDragEnd={noop}>
          <MockedProvider mocks={mocks}>
            <Timeline
              id="foo"
              columnHeaders={headers}
              columnRenderers={columnRenderers}
              dataProviders={mockDataProviders}
              onColumnSorted={noop}
              onDataProviderRemoved={noop}
              onFilterChange={noop}
              onRangeSelected={noop}
              onToggleDataProviderEnabled={noop}
              range={'1 Day'}
              rowRenderers={rowRenderers}
              sort={sort}
              width={1000}
            />
          </MockedProvider>
        </DragDropContext>
      );

      expect(wrapper.find('[data-test-subj="body"]').exists()).toEqual(true);
    });
  });

  describe('event wire up', () => {
    describe('onColumnSorted', () => {
      test('it invokes the onColumnSorted callback when a header is clicked', () => {
        const mockOnColumnSorted = jest.fn();

        const wrapper = mount(
          <DragDropContext onDragEnd={noop}>
            <MockedProvider mocks={mocks}>
              <Timeline
                id="foo"
                columnHeaders={headers}
                columnRenderers={columnRenderers}
                dataProviders={mockDataProviders}
                onColumnSorted={mockOnColumnSorted}
                onDataProviderRemoved={noop}
                onFilterChange={noop}
                onRangeSelected={noop}
                onToggleDataProviderEnabled={noop}
                range={'1 Day'}
                rowRenderers={rowRenderers}
                sort={sort}
                width={1000}
              />
            </MockedProvider>
          </DragDropContext>
        );

        wrapper
          .find('[data-test-subj="header"]')
          .first()
          .simulate('click');

        expect(mockOnColumnSorted).toBeCalledWith({
          columnId: headers[0].id,
          sortDirection: 'ascending',
        });
      });
    });

    describe('onDataProviderRemoved', () => {
      test('it invokes the onDataProviderRemoved callback when the close button on a provider is clicked', () => {
        const mockOnDataProviderRemoved = jest.fn();

        const wrapper = mount(
          <DragDropContext onDragEnd={noop}>
            <MockedProvider mocks={mocks}>
              <Timeline
                id="foo"
                columnHeaders={headers}
                columnRenderers={columnRenderers}
                dataProviders={mockDataProviders}
                onColumnSorted={noop}
                onDataProviderRemoved={mockOnDataProviderRemoved}
                onFilterChange={noop}
                onRangeSelected={noop}
                onToggleDataProviderEnabled={noop}
                range={'1 Day'}
                rowRenderers={rowRenderers}
                sort={sort}
                width={1000}
              />
            </MockedProvider>
          </DragDropContext>
        );

        wrapper
          .find('[data-test-subj="closeButton"]')
          .first()
          .simulate('click');

        const callbackParams = pick(
          ['enabled', 'id', 'name', 'negated'],
          mockOnDataProviderRemoved.mock.calls[0][0]
        );

        expect(callbackParams).toEqual({
          enabled: true,
          id: 'id-Provider 1',
          name: 'Provider 1',
          negated: false,
        });
      });
    });

    describe('onFilterChange', () => {
      test('it invokes the onFilterChange callback when the input is updated', () => {
        const newFilter = 'changed';
        const mockOnFilterChange = jest.fn();

        // for this test, all columns have text filters
        const allColumnsHaveTextFilters = headers.map(header => ({
          ...header,
          columnHeaderType: 'text-filter' as ColumnHeaderType,
        }));

        const wrapper = mount(
          <DragDropContext onDragEnd={noop}>
            <MockedProvider mocks={mocks}>
              <Timeline
                id="foo"
                columnHeaders={allColumnsHaveTextFilters}
                columnRenderers={columnRenderers}
                dataProviders={mockDataProviders}
                onColumnSorted={noop}
                onDataProviderRemoved={noop}
                onFilterChange={mockOnFilterChange}
                onRangeSelected={noop}
                onToggleDataProviderEnabled={noop}
                range={'1 Day'}
                rowRenderers={rowRenderers}
                sort={sort}
                width={1000}
              />
            </MockedProvider>
          </DragDropContext>
        );

        wrapper
          .find('[data-test-subj="textFilter"]')
          .at(2)
          .simulate('change', { target: { value: newFilter } });

        expect(mockOnFilterChange).toBeCalledWith({
          columnId: headers[0].id,
          filter: newFilter,
        });
      });
    });

    describe('onToggleDataProviderEnabled', () => {
      test('it invokes the onToggleDataProviderEnabled callback when the input is updated', () => {
        const mockOnToggleDataProviderEnabled = jest.fn();

        // for this test, all columns have text filters
        const allColumnsHaveTextFilters = headers.map(header => ({
          ...header,
          columnHeaderType: 'text-filter' as ColumnHeaderType,
        }));

        const wrapper = mount(
          <DragDropContext onDragEnd={noop}>
            <MockedProvider mocks={mocks}>
              <Timeline
                id="foo"
                columnHeaders={allColumnsHaveTextFilters}
                columnRenderers={columnRenderers}
                dataProviders={mockDataProviders}
                onColumnSorted={noop}
                onDataProviderRemoved={noop}
                onFilterChange={noop}
                onRangeSelected={noop}
                onToggleDataProviderEnabled={mockOnToggleDataProviderEnabled}
                range={'1 Day'}
                rowRenderers={rowRenderers}
                sort={sort}
                width={1000}
              />
            </MockedProvider>
          </DragDropContext>
        );

        wrapper
          .find('[data-test-subj="switchButton"]')
          .at(1)
          .simulate('click');

        const callbackParams = pick(
          ['enabled', 'dataProvider.id', 'dataProvider.name', 'dataProvider.negated'],
          mockOnToggleDataProviderEnabled.mock.calls[0][0]
        );

        expect(callbackParams).toEqual({
          dataProvider: {
            name: 'Provider 1',
            negated: false,
            id: 'id-Provider 1',
          },
          enabled: false,
        });
      });
    });
  });
});