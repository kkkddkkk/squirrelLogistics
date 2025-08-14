package com.gpt.squirrelLogistics.monitoring;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface TimedEndpoint {
	 // 메트릭/로그에서 구분하기 위한 이름 (ex. "request_list", "request_detail")
    String value();
}
