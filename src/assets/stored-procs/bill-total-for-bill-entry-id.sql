CREATE DEFINER=`root`@`localhost` PROCEDURE `billTotalForBillEntryId`($billEntryId int)
BEGIN
	declare $total decimal(10);
    declare $discountPercent int;
    declare $promocode varchar(45);
	select SUM(mr.menuPrice*be.quantity) into $total from bill_entry as be
            join menu_repo as mr on mr.menuItem = be.menuItem
            where be.billEntryId = $billEntryId;
	if $total > 1 then
		select promoCode into $promocode from bill_entry where billEntryId = $billEntryId;
		if promoCode is not null then
			select promoDiscountPercent into $discountPercent from promo_repo where promoCode = $promocode;
			set $total = $total - $total * $discountPercent / 100;
		end if;
		-- apply sgst and cgst
		set $total = $total + 0.05 * $total;
    end if;
	select $total as total;
END