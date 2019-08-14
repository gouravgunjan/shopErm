CREATE DEFINER=`root`@`localhost` PROCEDURE `applyPromoCode`($promoCode varchar(45))
BEGIN
	declare $newPromoCounter int;
    select promoCounter - 1 into $newPromoCounter from promo_repo where promoCode = $promoCode;
    IF $newPromoCounter >= 0 THEN
		update promo_repo set promoCounter = $newPromoCounter where promoCode = $promoCode;
		select true as result;
	ELSE 
		select false as result;
    END IF;
END