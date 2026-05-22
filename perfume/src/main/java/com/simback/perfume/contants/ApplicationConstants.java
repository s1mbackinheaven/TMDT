package com.simback.perfume.contants;

public class ApplicationConstants {
    public static final String OTP_CHARACTERS = "123456789";
    public static final Integer OTP_LENGTH = 6;

    public static final String maleProfilePicture = "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png";
    public static final String femaleProfilePicture = "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png";

    // Secret key cho JWT (256-bit)
    public static final String SECRET_KEY = "ccrXuiLgVTiwvxU5DwGPjRWdsSxG4dkSgRh9bkLycuw";
    public static final long ACCESS_TOKEN_VALIDITY_SECONDS = 60 * 60;      // 1 giờ
    public static final long REFRESH_TOKEN_VALIDITY_SECONDS = 30 * 24 * 60 * 60; // 30 ngày
}
