import stringify from "json-stable-stringify";

import { JoiValidatorsObj, UnknownObj } from "../../common";
import { appConfig } from "../../configs";
import { TourFields, TourDifficulties } from "../../constants";
import { tourRegularValidators } from "../../validators";
import { filterRequestObject } from "../../utils/filterRequestObject";

interface JestObj {
  obj: UnknownObj;
  allowedFields: string[];
  validators: JoiValidatorsObj;
  errorMsg?: string;
  output?: UnknownObj;
}

const allowedFields: string[] = [
  TourFields.NAME,
  TourFields.DURATION,
  TourFields.MAX_GROUP,
  TourFields.DIFFICULTY,
  TourFields.PRICE,
  TourFields.SUMM,
  TourFields.DESC,
  TourFields.START_DATES,
  TourFields.START_LOCATION,
  TourFields.LOCATIONS,
  TourFields.SECRET,
  TourFields.GUIDES
];

const testingData: JestObj[] = [
  {
    obj: {
      [TourFields.NAME]: "Super Tour"
    },
    allowedFields,
    validators: tourRegularValidators,
    output: {
      [TourFields.NAME]: "Super Tour",
      [TourFields.DURATION]: 1,
      [TourFields.MAX_GROUP]: 1,
      [TourFields.PRICE]: 0
    }
  },
  {
    obj: {
      [TourFields.DURATION]: 12,
      [TourFields.MAX_GROUP]: 10,
      [TourFields.PRICE]: 999
    },
    allowedFields,
    validators: tourRegularValidators,
    output: {
      [TourFields.NAME]: appConfig.TOUR_DEFAULT_NAME,
      [TourFields.DURATION]: 12,
      [TourFields.MAX_GROUP]: 10,
      [TourFields.PRICE]: 999
    }
  },
  {
    obj: {
      [TourFields.NAME]: "Awesome tour",
      [TourFields.DURATION]: 12,
      [TourFields.MAX_GROUP]: 10,
      [TourFields.DIFFICULTY]: "medium",
      [TourFields.PRICE]: 999,
      [TourFields.SUMM]: "Some hard awesome tour..",
      [TourFields.DESC]: "Here should be long description..",
      [TourFields.START_DATES]: [
        "2022-07-19T09:00:00.000Z",
        "2022-12-31T09:00:00.000Z",
        "2022-03-18T10:00:00.000Z"
      ],
      [TourFields.START_LOCATION]: {
        coordinates: [-115.570154, 51.178456],
        address: "224 Banff Ave, Banff, AB, Canada",
        description: "Banff, CAN"
      },
      [TourFields.LOCATIONS]: [
        {
          description: "California, USA",
          coordinates: [-118.803461, 34.006072],
          day: 2
        },
        {
          description: "Banff, Canada",
          coordinates: [-115.570154, 51.178456],
          day: 5
        }
      ],
      [TourFields.SECRET]: false,
      [TourFields.GUIDES]: [
        "5c8a21d02f8fb814b56fa189",
        "5c8a201e2f8fb814b56fa186",
        "5c8a1f292f8fb814b56fa184"
      ]
    },
    allowedFields,
    validators: tourRegularValidators,
    output: {
      [TourFields.NAME]: "Awesome tour",
      [TourFields.DURATION]: 12,
      [TourFields.MAX_GROUP]: 10,
      [TourFields.DIFFICULTY]: TourDifficulties.NORMAL,
      [TourFields.PRICE]: 999,
      [TourFields.SUMM]: "Some hard awesome tour..",
      [TourFields.DESC]: "Here should be long description..",
      [TourFields.START_DATES]: [
        "2022-07-19T09:00:00.000Z",
        "2022-12-31T09:00:00.000Z",
        "2022-03-18T10:00:00.000Z"
      ],
      [TourFields.START_LOCATION]: {
        coordinates: [-115.570154, 51.178456],
        address: "224 Banff Ave, Banff, AB, Canada",
        description: "Banff, CAN"
      },
      [TourFields.LOCATIONS]: [
        {
          description: "California, USA",
          coordinates: [-118.803461, 34.006072],
          day: 2
        },
        {
          description: "Banff, Canada",
          coordinates: [-115.570154, 51.178456],
          day: 5
        }
      ],
      [TourFields.SECRET]: false,
      [TourFields.GUIDES]: [
        "5c8a21d02f8fb814b56fa189",
        "5c8a201e2f8fb814b56fa186",
        "5c8a1f292f8fb814b56fa184"
      ]
    }
  },
  {
    obj: {
      [TourFields.DURATION]: 10000
    },
    allowedFields,
    validators: tourRegularValidators,
    output: { error: true }
  },
  {
    obj: {
      [TourFields.GUIDES]: ["5c8a21d02f8fb814b56fa189", "5c8a201e2f8fb814b56fa"]
    },
    allowedFields,
    validators: tourRegularValidators,
    output: { error: true }
  },
  {
    obj: {
      [TourFields.LOCATIONS]: [
        {
          description: "California, USA",
          coordinates: [-118.803461, 234.006072],
          day: 2
        }
      ]
    },
    allowedFields,
    validators: tourRegularValidators,
    output: { error: true }
  },
  {
    obj: {
      [TourFields.LOCATIONS]: [
        {
          description: "California, USA",
          day: 2
        }
      ]
    },
    allowedFields,
    validators: tourRegularValidators,
    output: { error: true }
  }
];

describe("Test utils", () => {
  test("Test filterRequestObject", () => {
    for (const item of testingData) {
      try {
        const filteredRequest = filterRequestObject(
          item.obj,
          item.allowedFields,
          item.validators
        );
        expect(stringify(filteredRequest)).toBe(stringify(item.output));
      } catch (_err) {
        expect(item.output.error).toBe(true);
      }
    }
  });
});
