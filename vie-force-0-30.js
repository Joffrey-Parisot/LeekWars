// TODO faire une classe me représentant
// TODO faire une classe représentant l'adversaire
// TODO faire une classe représentant le jeu

debug('Tour n°' + getTurn());

// Moi
global me = getLeek();

// Je récupère l'ennemi le plus proche
global myEnemy = getNearestEnemy();



// Si j'ai pas encore d'arme équipée, ben on s'équipe
if (getWeapon() === null) {
	debug('Je prends le Double Gun');

	// J'équipe le Shot Gun
	setWeapon(WEAPON_SHOTGUN);	
}

// Si je peux le buter avec mon arme, ben je le bute
// TODO à améliorer pour la magie du coup
if (canIKillThisFuckingLeek(myEnemy, getTotalDamageByWeapon())) {
	debug('Je peux le buter !');
	
	doFight();
} else {
	debug('Je ne peux pas le buter !');
	
	doBuffs();
	doFight();
}

// J'applique mes buffs
function doBuffs () {
	debug('J\'applique mes buffs');

	// Si j'ai pas toute ma vie, je me soigne
	if (getLife() < getTotalLife() - 15) {
		debug('Je me soigne');
		useChip(CHIP_BANDAGE, me);
	}
	
	// Si je peux lancer le Casque, ben je le fais (tous les 3 tours)
	if (getTurn() % 3 == 0) {
		debug('Je mets mon casque');
		useChip(CHIP_HELMET, me);
	}
	
	debug('Fin de doBuffs');
}

// J'attaque !
function doFight () {
	debug('J\'attaque !');
	
	// Pour savoir si j'ai réussi à tirer
	var weaponIsUsed = true;
	
	// Pour savoir si j'ai réussi à utiliser ma Puce
	var chipIsUsed = true;

	// Si je suis au CàC et que la portée de mon arme est supérieure à 1
	if (isMelee(myEnemy) && getWeaponMinRange() > 1) {
		debug('Je bouge d\'1 case');

		// Je bouge d'1 case
		moveAwayFrom(myEnemy, 1);
	} else {
		debug('J\'avance');

		// TODO ne pas avancer si ça me fait le coller trop près pour pas pouvoir utiliser la range de mon arme !!!!!!!!!
		// J'avance vers l'ennemi
		moveToward(myEnemy);
	}
	

	// TODO canUseWeapon lvl 29
	// Si j'ai assez de TP, j'essaye de lui tirer dessus !
	while (getTP() >= getWeaponCost(getWeapon()) && weaponIsUsed) {
		debug('Je tente de tirer');
		
		weaponIsUsed = useWeapon(myEnemy);
		debug('TP restant : ' + getTP());

		if (weaponIsUsed != USE_SUCCESS) {
			debug('Je ne l\'ai pas touché !');
			weaponIsUsed = false;
		} else {
			debug('Je l\'ai touché !');
			weaponIsUsed = false;
		}
	}
	
	// Si j'ai assez de TP, j'utilise une Puce
	while (getTP() >= getChipCost(CHIP_SPARK) && chipIsUsed) {
		debug('Je tente de lui crâmer la tronche');
		
		chipIsUsed = useChip(CHIP_SPARK, myEnemy);
		debug('TP restant : ' + getTP());
		
		if (chipIsUsed != USE_SUCCESS) {
			debug('Je ne l\'ai pas crâmé !');
			chipIsUsed = false;
		} else {
			debug('Je l\'ai crâmé !');
			chipIsUsed = false;
		}
	}

	debug('Fin de doFight');
}



/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

// Retourne True si je suis au CàC, False sinon
function isMelee (enemy) {
	var myPos = getCell();
	var enemyPos = getCell(enemy);
	var meleePos = [-17, 17, -18, 18];
	
	if (inArray(meleePos, (myPos - enemyPos))) {
		debug('Je suis au CàC !');
		return true;
	}
	else {
		debug('Je ne suis pas au CàC !');
		return false;
	}
}

// Retourne mes dégâts totaux mini que je peux faire avec l'arme équipée
function getTotalDamageByWeapon () {
	var aWeaponEffects = getWeaponEffects(getWeapon());
	var iTotalDamageByWeapon = 0;
	
	// Pour chaque ligne de dégâts sur l'arme, je prends le jet mini
	for (var i = 0; i < count(aWeaponEffects); i++) {
		// aWeaponEffects[i] = [1, 18.0, 25.0, 0, 31] = [type, min, max, turns, targets]

		// Et je calcule les dégâts que je peux faire au total
		iTotalDamageByWeapon = iTotalDamageByWeapon + (aWeaponEffects[i][1] * (1 + getStrength() / 100));
	}
	
	return iTotalDamageByWeapon;
}

// TODO à adapter pour la magie
// Est-ce que je peux tuer mon adversaire ?
function canIKillThisFuckingLeek (iLeek, iTotalDamages) {
	var iAbsoluteShield = 0;
	var iRelativeShield = 0;
	var iFinalDamages = 0;
	var multiplier = 0;

	// Bouclier Absolu de l'adversaire : (Bouclier absolu de base) * (1 + Résistance / 100)
	//iAbsoluteShield = getAbsoluteShield(iLeek); // TODO lvl 38
	
	// Bouclier Relatif de l'adversaire : (Bouclier relatif de base) + Résistance / 50
	//iRelativeShield = getRelativeShield(iLeek); // TODO lvl 38
	
	// J'applique les résistances de l'adversaire : Dégâts finaux = (Dégâts de base) * (1 - Bouclier relatif / 100) - Bouclier absolu
	iFinalDamages = iTotalDamages * (1 - iRelativeShield / 100) - iAbsoluteShield;
	
	// Je multiplie ces dégâts par le nombre de fois que je peux tirer
	multiplier = floor((getTP() / getWeaponCost(getWeapon())));	
	iFinalDamages = iFinalDamages * multiplier;
	debug('Dégâts finaux : ' + iFinalDamages);
	
	// Si les dégâts finaux sont supérieurs ou égaux à sa vie restante, c'est que je peux le dézinguer en beauté
	if (iFinalDamages >= getLife(iLeek)) {
		return true;
	} else {
		return false;
	}
}