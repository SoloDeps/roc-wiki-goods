import goodTailor from "~/assets/goods/good_tailor.webp";
import goodStoneMason from "~/assets/goods/good_stone_mason.webp";
import goodArtisan from "~/assets/goods/good_artisan.webp";
import goodScribe from "~/assets/goods/good_scribe.webp";
import goodCarpenter from "~/assets/goods/good_carpenter.webp";
import goodSpiceMerchant from "~/assets/goods/good_spice_merchant.webp";
import goodDefault from "~/assets/goods/good_default.webp";

export const defaultGood = goodDefault;

export const assetGoods: Record<string, string> = {
  tailor: goodTailor,
  stone_mason: goodStoneMason,
  artisan: goodArtisan,
  scribe: goodScribe,
  carpenter: goodCarpenter,
  spice_merchant: goodSpiceMerchant,
};
