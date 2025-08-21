package com.gpt.squirrelLogistics.service.deliveryTrackingLog;

import com.gpt.squirrelLogistics.common.LatLng;

public interface DeliveryTrackingLogService {

	void save(String driverId, Long long1, LatLng curr);

}
