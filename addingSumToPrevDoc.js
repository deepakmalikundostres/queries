let i = 0;
  let startDay;
  let endDay;
  let startDayIst;
  const mp = {};
  
  while (!startDay || new Date(startDay) < new Date("2023-07-31")) {
    startDay = moment("2023-02-16").tz("Asia/Kolkata").startOf('day').add(i, 'days').format();
    endDay = moment("2023-02-16").tz("Asia/Kolkata").endOf('day').add(i, 'days').format();
    startDayIst = moment("2023-02-16").tz("Asia/Kolkata").startOf('day').add(i, 'days').add(5, 'hours').add(30, 'minutes').format();
    console.log(startDayIst);
    const pipeline = [{
      $match: {
        istTimestamp: new Date(startDayIst),
      },
    }];
  
    const docs = await CreatorEarnSummary.aggregate(pipeline);
  
    const bulkUpdateOps = [];
  
    if (docs.length) {
      docs.forEach((doc) => {
        console.log(doc.creatorVideoStat.dailyWatchTimeSec);
        if (mp[doc.userId]) {
          
          mp[doc.userId] += doc.creatorVideoStat.dailyWatchTimeSec;
        } else {
          mp[doc.userId] = doc.creatorVideoStat.dailyWatchTimeSec;
        }
  
        const updateOperation = {
          updateOne: {
            filter: {
              "userId": new ObjectId(doc.userId),
              istTimestamp: new Date(startDayIst)
             },
            update: {
              $set: {
                "creatorVideoStat.totalWatchTimeSec": mp[doc.userId],
              },
            },
            upsert: true,
          },
        };
  
        bulkUpdateOps.push(updateOperation);
      });
    }
    
    await CreatorEarnSummary.bulkWrite(bulkUpdateOps);
  
    i++;
  }
  
