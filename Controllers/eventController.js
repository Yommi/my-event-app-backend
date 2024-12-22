const factory = require('../Controllers/factoryController');
const authController = require('../Controllers/authController');
const Event = require('../Models/eventModel');
const User = require('../Models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.setHostId = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;

  // FOR getMyEvents
  req.params.userId = req.user.id;

  next();
});

exports.createEvent = factory.createOne(Event);
exports.deleteEvent = factory.deleteOne(Event);
exports.updateEvent = factory.updateOne(Event);
exports.getEvent = factory.getOne(Event);
exports.getAllEvents = factory.getAll(Event);

exports.getUserEvents = catchAsync(async (req, res, next) => {
  const user = req.user;
  if (!user) return next(new AppError('You are not logged in!', 404));

  const events = await Event.find({ host: user.id });

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: events,
  });
});

exports.updateMyEvent = catchAsync(async (req, res, next) => {
  const user = req.user;
  const event = await Event.findById(req.query.event);

  if (!user._id.equals(event.host)) {
    return next(new AppError('You are not allowed to update this event'));
  }

  const filteredBody = authController.filterObj(req.body, 'host');
  req.body = filteredBody;
  const doc = await Event.findByIdAndUpdate(req.query.event, req.body, {
    new: true,
    runValidators: true,
  });

  if (!doc) {
    return next(new AppError('There is no document with that id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: doc,
  });
});

exports.deleteMyEvent = catchAsync(async (req, res, next) => {
  const user = req.user;
  const event = await Event.findById(req.query.event);

  if (!user._id.equals(event.host)) {
    return next(new AppError('You are not allowed to delete this event'));
  }

  if (!event) {
    return next(new AppError('There is no document with that id', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getEventsByLocation = catchAsync(async (req, res, next) => {
  const {
    lat,
    lng,
    query = '',
    page = 1,
    limit = 5,
    noLimit = false,
  } = req.query;

  const skip = (page - 1) * limit;

  if (!lat || !lng) {
    return next(new AppError('Latituted and longitude required', 400));
  }

  const paginationStage = noLimit
    ? [] // If noLimit=true, don't apply skip or limit
    : [{ $skip: skip }, { $limit: parseInt(limit) }];

  const events = await Event.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        distanceField: 'distance', // Adds the distance from the user to the event
        spherical: true,
      },
    },

    {
      $lookup: {
        from: 'users',
        localField: 'host',
        foreignField: '_id',
        as: 'hostDetails',
      },
    },
    // Flatten the 'hostDetails' array (because $lookup returns an array)
    {
      $unwind: {
        path: '$hostDetails',
        // preserveNullAndEmptyArrays: true, // Optional: keep events without a host
      },
    },
    // Fields included in output
    {
      $project: {
        hostDetails: {
          username: 1,
        },
        name: 1,
        description: 1,
        host: 1,
        startTime: 1,
        date: 1,
        price: 1,
        currency: 1,
        private: 1,
        displayCover: 1,
        location: 1,
        tags: 1,
        displayVideo: 1,
        distance: 1,
        priority: 1,
      },
    },
    // Add priority scores based on search query
    {
      $addFields: {
        priority: {
          $switch: {
            branches: [
              {
                case: {
                  $regexMatch: {
                    input: '$name',
                    regex: new RegExp(query, 'i'),
                  },
                },
                then: 1,
              },
              {
                case: {
                  $regexMatch: {
                    input: '$location.address',
                    regex: new RegExp(query, 'i'),
                  },
                },
                then: 2,
              },
              {
                case: {
                  $regexMatch: {
                    input: '$time',
                    regex: new RegExp(query, 'i'),
                  },
                },
                then: 3,
              },
              {
                case: {
                  $regexMatch: {
                    input: '$hostDetails.username',
                    regex: new RegExp(query, 'i'),
                  },
                },
                then: 4,
              },
            ],
            default: 5, // Lowest priority for no matches
          },
        },
      },
    },
    // Filter out events with no matches if needed
    { $match: { priority: { $ne: 5 } } },
    // Sort by priority first, then by date
    { $sort: { distance: 1, priority: 1, date: 1 } },
    ...paginationStage,
  ]);

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: events,
  });
});

exports.register = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const eventId = req.query.event;

  const event = await Event.findById(eventId);

  if (!event.registeredUsers.includes(userId)) {
    event.registeredUsers.push(userId);
    event.save();
  } else {
    return next(
      new AppError('User is already registered for this event', 401)
    );
  }

  res.status(200).json({
    status: 'success',
    data: event,
  });
});

exports.checkIfRegistered = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const eventId = req.query.event;

  const event = await Event.findById(eventId);

  if (event.registeredUsers.includes(userId)) {
    res.send(true);
  } else {
    res.send(false);
  }
});

exports.eventsRegisteredFor = catchAsync(async (req, res, next) => {
  const events = await Event.find({
    registeredUsers: { $in: [req.user._id] },
  });

  res.status(200).json({
    status: 'sucess',
    results: events.length,
    data: events,
  });
});

exports.unregister = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const eventId = req.query.event;

  const event = await Event.findById(eventId);
  if (event.registeredUsers.includes(userId)) {
    if (event.host.toString() === userId.toString()) {
      return next(
        new AppError('Host cannot unregister from their own event', 401)
      );
    } else {
      await Event.updateOne(
        { _id: eventId },
        { $pull: { registeredUsers: userId } }
      );
    }
  } else {
    return next(
      new AppError('User was not registered for this event', 401)
    );
  }

  res.status(200).json({
    status: 'success',
  });
});
// exports.getEventsByRegion = catchAsync(async (req, res, next) => {
//   const { lat, lng, latDelta, lngDelta } = req.query;

//   const southWestLat = parseFloat(lat) - parseFloat(latDelta) / 2;
//   const northEastLat = parseFloat(lat) + parseFloat(latDelta) / 2;
//   const southWestLng = parseFloat(lng) - parseFloat(lngDelta) / 2;
//   const northEastLng = parseFloat(lng) + parseFloat(lngDelta) / 2;

//   const events = await Event.find({
//     location: {
//       $geoWithin: {
//         $box: [
//           [southWestLng, southWestLat],
//           [northEastLng, northEastLat],
//         ],
//       },
//     },
//   }).populate('host');

//   res.status(200).json({
//     status: 'success',
//     results: events.length,
//     data: events,
//   });
// });

// exports.getNearMe = catchAsync(async (req, res, next) => {
//   const { lat, lng, query = '', page = 1 } = req.query;

//   if (!lat || !lng) {
//     return next(new AppError('Latituted and longitude required', 400));
//   }

//   const radius = 10 * 1000; // 10km;

//   const events = await Event.aggregate([
//     // Filter events within the radius
//     {
//       $geoNear: {
//         near: {
//           type: 'Point',
//           coordinates: [parseFloat(lng), parseFloat(lat)],
//         },
//         maxDistance: radius,
//         distanceField: 'distance', // Adds the distance from the user to the event
//         spherical: true,
//       },
//     },

//     // Sort by date first (ascending order, most recent first)
//     { $sort: { date: 1 } },

//     {
//       $lookup: {
//         from: 'users',
//         localField: 'host',
//         foreignField: '_id',
//         as: 'hostDetails',
//       },
//     },
//     // Flatten the 'hostDetails' array (because $lookup returns an array)
//     {
//       $unwind: {
//         path: '$hostDetails',
//         // preserveNullAndEmptyArrays: true, // Optional: keep events without a host
//       },
//     },
//     // Add priority scores based on search query
//     {
//       $addFields: {
//         priority: {
//           $switch: {
//             branches: [
//               {
//                 case: {
//                   $regexMatch: {
//                     input: '$name',
//                     regex: new RegExp(query, 'i'),
//                   },
//                 },
//                 then: 1,
//               },
//               {
//                 case: {
//                   $regexMatch: {
//                     input: '$location.address',
//                     regex: new RegExp(query, 'i'),
//                   },
//                 },
//                 then: 2,
//               },
//               {
//                 case: {
//                   $regexMatch: {
//                     input: '$time',
//                     regex: new RegExp(query, 'i'),
//                   },
//                 },
//                 then: 3,
//               },
//             ],
//             default: 4, // Lowest priority for no matches
//           },
//         },
//       },
//     },
//     // Filter out events with no matches if needed
//     { $match: { priority: { $ne: 4 } } },
//     // Sort by priority first, then by date
//     { $sort: { priority: 1, date: 1 } },
//   ]);

//   res.status(200).json({
//     status: 'success',
//     results: events.length,
//     data: events,
//   });
// });

// exports.getNotNearMe = catchAsync(async (req, res, next) => {
//   const { lat, lng, query = '' } = req.query;

//   if (!lat || !lng) {
//     return next(new AppError('Latitude and longitude required', 400));
//   }

//   const radius = 10 * 1000;

//   // Find events outside the radius
//   const farEvents = await Event.aggregate([
//     // Filter events outside the 10km radius
//     {
//       $geoNear: {
//         near: {
//           type: 'Point',
//           coordinates: [parseFloat(lng), parseFloat(lat)],
//         },
//         distanceField: 'distance', // Adds the distance from the user to the event
//         spherical: true,
//       },
//     },
//     // Filter out events that are within the 10km radius
//     {
//       $match: {
//         distance: { $gt: radius }, // Only events farther than 10km
//       },
//     },
//     // Sort by date (ascending order, older events first)
//     { $sort: { date: 1 } },

//     // Lookup the 'host' field to get more details
//     {
//       $lookup: {
//         from: 'users', // The collection to join (replace with your users collection name)
//         localField: 'host', // Field in Event model referencing the host (user ID)
//         foreignField: '_id', // Field in users collection to match with Event's 'host'
//         as: 'hostDetails', // The alias to return the populated data under
//       },
//     },
//     // Unwind the 'hostDetails' array (because $lookup returns an array)
//     {
//       $unwind: {
//         path: '$hostDetails',
//         preserveNullAndEmptyArrays: true, // Optional: if events may not have a host
//       },
//     },
//     // Add priority scores based on the search query
//     {
//       $addFields: {
//         priority: {
//           $switch: {
//             branches: [
//               {
//                 case: {
//                   $regexMatch: {
//                     input: '$name',
//                     regex: new RegExp(query, 'i'),
//                   },
//                 },
//                 then: 1,
//               },
//               {
//                 case: {
//                   $regexMatch: {
//                     input: '$location.address',
//                     regex: new RegExp(query, 'i'),
//                   },
//                 },
//                 then: 2,
//               },
//               {
//                 case: {
//                   $regexMatch: {
//                     input: '$time',
//                     regex: new RegExp(query, 'i'),
//                   },
//                 },
//                 then: 3,
//               },
//             ],
//             default: 4, // Lowest priority for no matches
//           },
//         },
//       },
//     },
//     // Filter out events with no matches based on the priority score
//     { $match: { priority: { $ne: 4 } } },
//     // Sort by priority first, then by date
//     { $sort: { priority: 1, date: 1 } },
//   ]);

//   res.status(200).json({
//     status: 'success',
//     results: farEvents.length,
//     data: farEvents,
//   });
// });
